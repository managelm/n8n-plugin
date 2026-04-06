import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createHmac, randomBytes } from 'crypto';

import { manageLmApiRequest } from './GenericFunctions';

export class ManageLmTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ManageLM Trigger',
		name: 'manageLmTrigger',
		icon: 'file:managelm.png',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Start a workflow when a ManageLM event occurs',
		defaults: { name: 'ManageLM Trigger' },
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'manageLmApi',
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
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				options: [
					{ name: 'Agent Approved', value: 'agent.approved' },
					{ name: 'Agent Enrolled', value: 'agent.enrolled' },
					{ name: 'Agent Offline', value: 'agent.offline' },
					{ name: 'Agent Online', value: 'agent.online' },
					{ name: 'Task Completed', value: 'task.completed' },
					{ name: 'Task Failed', value: 'task.failed' },
					{ name: 'Task Needs Input', value: 'task.needs_input' },
				],
				description: 'Which events should trigger the workflow',
			},
		],
	};

	webhookMethods = {
		default: {
			/**
			 * Create a webhook in ManageLM when the workflow is activated.
			 * Generates an HMAC secret and stores it + the webhook ID in static data.
			 */
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');
				if (staticData.webhookId) {
					// Verify the webhook still exists in ManageLM
					try {
						const response = await manageLmApiRequest.call(this, 'GET', '/webhooks');
						const webhooks = response.webhooks ?? [];
						return webhooks.some((w: any) => w.id === staticData.webhookId);
					} catch {
						return false;
					}
				}
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				if (!webhookUrl) {
					throw new NodeOperationError(this.getNode(), 'Failed to generate webhook URL — check your n8n base URL configuration');
				}
				const events = this.getNodeParameter('events') as string[];

				if (events.length === 0) {
					throw new NodeOperationError(this.getNode(), 'Select at least one event');
				}

				// Generate HMAC secret for signature verification
				const secret = randomBytes(32).toString('hex');

				const response = await manageLmApiRequest.call(this, 'POST', '/webhooks', {
					url: webhookUrl,
					events,
					secret,
				});

				const webhook = response.webhook;
				if (!webhook?.id) {
					throw new NodeOperationError(this.getNode(), 'Failed to create webhook in ManageLM');
				}

				// Persist webhook ID and secret so we can clean up and verify signatures
				const staticData = this.getWorkflowStaticData('node');
				staticData.webhookId = webhook.id;
				staticData.webhookSecret = secret;

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');
				const webhookId = staticData.webhookId as string | undefined;

				if (webhookId) {
					try {
						await manageLmApiRequest.call(this, 'DELETE', `/webhooks/${webhookId}`);
					} catch {
						// Webhook may already be gone — ignore
					}
					delete staticData.webhookId;
					delete staticData.webhookSecret;
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const res = this.getResponseObject();
		const body = req.body as { event?: string; timestamp?: string; data?: Record<string, unknown> };

		// Verify HMAC signature if we have a secret
		const staticData = this.getWorkflowStaticData('node');
		const secret = staticData.webhookSecret as string | undefined;

		if (secret) {
			const signature = req.headers['x-webhook-signature'] as string | undefined;
			if (!signature) {
				res.status(403);
				return { webhookResponse: 'Missing signature', workflowData: [] };
			}

			const rawBody = JSON.stringify(body);
			const expected = createHmac('sha256', secret).update(rawBody).digest('hex');

			if (signature !== expected) {
				res.status(403);
				return { webhookResponse: 'Invalid signature', workflowData: [] };
			}
		}

		return {
			workflowData: [
				this.helpers.returnJsonArray({
					event: body.event,
					timestamp: body.timestamp,
					...body.data,
				}),
			],
		};
	}
}
