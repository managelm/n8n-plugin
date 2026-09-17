import type {
	IDataObject,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Every event the portal delivers to webhooks, grouped by the category a
 * ManageLM webhook subscribes to (Settings > MCP & API > Webhooks).
 */
const EVENTS: Array<{ name: string; value: string }> = [
	{ name: 'Agent Approved', value: 'agent.approved' },
	{ name: 'Agent Enrolled', value: 'agent.enrolled' },
	{ name: 'Agent Offline', value: 'agent.offline' },
	{ name: 'Agent Online', value: 'agent.online' },
	{ name: 'Backup Completed', value: 'backup.completed' },
	{ name: 'Backup Failed', value: 'backup.failed' },
	{ name: 'Certificate Deleted', value: 'cert.deleted' },
	{ name: 'Certificate Issued', value: 'cert.issued' },
	{ name: 'Certificate Reactivated', value: 'cert.reactivated' },
	{ name: 'Certificate Renewal Failed', value: 'cert.renewal_failed' },
	{ name: 'Certificate Renewed', value: 'cert.renewed' },
	{ name: 'Certificate Revoked', value: 'cert.revoked' },
	{ name: 'Console Closed', value: 'console.closed' },
	{ name: 'Console Opened', value: 'console.opened' },
	{ name: 'Credential Rotated', value: 'credential.rotated' },
	{ name: 'Credential Rotation Failed', value: 'credential.rotation_failed' },
	{ name: 'Desktop Closed', value: 'desktop.closed' },
	{ name: 'Desktop Opened', value: 'desktop.opened' },
	{ name: 'File Browser Opened', value: 'files.opened' },
	{ name: 'Keystore Access Denied', value: 'keystore.access_denied' },
	{ name: 'Keystore Key Deleted', value: 'keystore.key_deleted' },
	{ name: 'Monitor Created', value: 'monitor.created' },
	{ name: 'Monitor Deleted', value: 'monitor.deleted' },
	{ name: 'Monitor Down', value: 'monitor.down' },
	{ name: 'Monitor Stalled', value: 'monitor.stalled' },
	{ name: 'Monitor Up', value: 'monitor.up' },
	{ name: 'Pentest Completed', value: 'pentest.completed' },
	{ name: 'Pentest Failed', value: 'pentest.failed' },
	{ name: 'Report Completed', value: 'report.completed' },
	{ name: 'Report Failed', value: 'report.failed' },
	{ name: 'Report Stalled', value: 'report.stalled' },
	{ name: 'Task Completed', value: 'task.completed' },
	{ name: 'Task Failed', value: 'task.failed' },
	{ name: 'Task Needs Input', value: 'task.needs_input' },
];

/**
 * How far a delivery's signed `timestamp` may be from now, either way. The
 * portal signs the body once and makes up to 3 attempts with it (10 s timeout
 * each, ~2 s then ~4 s backoff), so a genuine delivery arrives within about
 * 40 s; a replayed one is refused once this has passed. Wide enough to absorb
 * ordinary clock drift between the portal and n8n.
 */
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

/**
 * Deliveries accepted inside that window: key → when it can be forgotten (its
 * signed timestamp + MAX_CLOCK_SKEW_MS; the timestamp check refuses it from
 * then on). The signature covers the whole body, timestamp included, so a
 * repeat is the same delivery again — a replay, or a portal retry after a lost
 * response — and must not start the workflow twice.
 *
 * Per n8n process: with several webhook processes (queue mode) a repeat that
 * lands on another one is not caught, and only the timestamp bounds it. Capped
 * so a burst of deliveries cannot grow it without limit; past the cap the
 * oldest entry goes first.
 */
const seenDeliveries = new Map<string, number>();
const MAX_SEEN_DELIVERIES = 10_000;

/** Remember a delivery. False when it was already seen and has not expired. */
function isFirstDelivery(key: string, forgetAt: number, now: number): boolean {
	// Every delivery prunes: at most MAX_SEEN_DELIVERIES entries to walk.
	for (const [seenKey, seenForgetAt] of seenDeliveries) {
		if (seenForgetAt < now) seenDeliveries.delete(seenKey);
	}
	if (seenDeliveries.has(key)) return false;
	if (seenDeliveries.size >= MAX_SEEN_DELIVERIES) {
		// A Map iterates in insertion order: the first key is the oldest.
		seenDeliveries.delete(seenDeliveries.keys().next().value as string);
	}
	seenDeliveries.set(key, forgetAt);
	return true;
}

/**
 * Starts a workflow when ManageLM delivers a webhook.
 *
 * Webhooks are created by an admin in the portal (Settings > MCP & API >
 * Webhooks), not by this node: API keys cannot manage webhooks. The admin pastes
 * this node's Production URL and a secret there, and the same secret goes into
 * a ManageLM Webhook credential here. Every delivery is HMAC-SHA256 verified
 * against it, refused when its timestamp is outside the replay window, and
 * acknowledged without a run when it repeats a delivery already accepted.
 */
export class ManageLmTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ManageLM Trigger',
		name: 'manageLmTrigger',
		icon: 'file:managelm.png',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].length ? $parameter["events"].join(", ") : "All events"}}',
		description: 'Start a workflow when a ManageLM event occurs',
		defaults: { name: 'ManageLM Trigger' },
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'manageLmWebhookApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName:
					'Create a webhook in ManageLM (Settings > MCP & API > Webhooks, admins only) with this node\'s Production URL, pick the event categories and set a secret. Put the same secret in the ManageLM Webhook credential.',
				name: 'setupNotice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				default: [],
				options: EVENTS,
				description: 'Only start the workflow for these events. Leave empty for every event the webhook receives.',
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const res = this.getResponseObject();

		// Refusals write their own 403 and return noWebhookResponse. A
		// `webhookResponse` is sent with the webhook's responseCode (200), which
		// overrides any res.status() set here — the portal would then record a
		// refused delivery as delivered and never flag the misconfiguration.
		const reject = (message: string): IWebhookResponseData => {
			res.status(403).json({ error: message });
			return { noWebhookResponse: true };
		};

		const { secret } = await this.getCredentials<{ secret?: string }>('manageLmWebhookApi');
		if (!secret) return reject('Webhook secret not configured');

		const signature = req.headers['x-webhook-signature'];
		if (typeof signature !== 'string' || signature === '') return reject('Missing signature');

		// Sign the raw request bytes: re-serializing the parsed body could differ
		// from what the portal signed. n8n keeps them in req.rawBody; the
		// JSON.stringify fallback matches the portal's own serialization.
		const rawBody: Buffer = (req as { rawBody?: Buffer }).rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
		const expected = Buffer.from(createHmac('sha256', secret).update(rawBody).digest('hex'), 'utf8');
		const received = Buffer.from(signature, 'utf8');

		// Compare bytes, not characters: a non-ASCII header can have the right
		// string length but a different byte length, and timingSafeEqual throws
		// (a 500) on unequal lengths. Constant-time for equal lengths.
		if (received.byteLength !== expected.byteLength || !timingSafeEqual(received, expected)) {
			return reject('Invalid signature');
		}

		// The timestamp is part of the signed body, so it is trustworthy now.
		// Refusing old deliveries keeps a captured one from being replayed.
		const now = Date.now();
		const body = (req.body ?? {}) as { event?: string; timestamp?: unknown; data?: IDataObject };
		const sentAt = typeof body.timestamp === 'string' ? Date.parse(body.timestamp) : NaN;
		if (Number.isNaN(sentAt) || Math.abs(now - sentAt) > MAX_CLOCK_SKEW_MS) {
			return reject('Missing or stale timestamp');
		}

		// Inside the window, a delivery already accepted is acknowledged with a
		// plain 200 and no run (see seenDeliveries). Not a 403: a portal retry is
		// genuine, and a refusal would count as a failed delivery. Keyed per
		// trigger node, since two workflows may share one webhook secret.
		const deliveryKey = `${this.getWorkflow().id ?? ''}:${this.getNode().id}:${signature}`;
		if (!isFirstDelivery(deliveryKey, sentAt + MAX_CLOCK_SKEW_MS, now)) {
			return { webhookResponse: 'Duplicate delivery ignored' };
		}

		// The portal delivers a whole category; filter to the chosen events.
		// No workflowData: a plain 200 acknowledges the delivery without a run.
		const events = this.getNodeParameter('events', []) as string[];
		if (events.length > 0 && !events.includes(body.event ?? '')) {
			return { webhookResponse: 'Event ignored' };
		}

		return {
			workflowData: [
				this.helpers.returnJsonArray({
					event: body.event,
					timestamp: body.timestamp,
					...body.data,
				} as IDataObject),
			],
		};
	}
}
