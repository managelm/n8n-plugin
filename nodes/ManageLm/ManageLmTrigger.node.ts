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
 * portal builds the body once and retries it within about 15 s, so a genuine
 * delivery is always well inside this; a replayed one is not. Wide enough to
 * absorb ordinary clock drift between the portal and n8n.
 */
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

/**
 * Starts a workflow when ManageLM delivers a webhook.
 *
 * Webhooks are created by an admin in the portal (Settings > MCP & API >
 * Webhooks), not by this node: API keys cannot manage webhooks. The admin pastes
 * this node's Production URL and a secret there, and the same secret goes into
 * a ManageLM Webhook credential here. Every delivery is HMAC-SHA256 verified
 * against it, and refused when its timestamp is outside the replay window.
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
		const body = (req.body ?? {}) as { event?: string; timestamp?: unknown; data?: IDataObject };
		const sentAt = typeof body.timestamp === 'string' ? Date.parse(body.timestamp) : NaN;
		if (Number.isNaN(sentAt) || Math.abs(Date.now() - sentAt) > MAX_CLOCK_SKEW_MS) {
			return reject('Missing or stale timestamp');
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
