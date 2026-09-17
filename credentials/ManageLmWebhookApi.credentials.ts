import type {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * The HMAC secret of a ManageLM webhook, used by the ManageLM Trigger to verify
 * deliveries. A credential rather than a node parameter so the secret stays out
 * of workflow JSON, exports and version history.
 *
 * No `authenticate` / `test`: nothing is sent to the portal with it. The portal
 * signs each delivery with the secret, and the trigger checks the signature.
 */
export class ManageLmWebhookApi implements ICredentialType {
	name = 'manageLmWebhookApi';
	displayName = 'ManageLM Webhook';
	documentationUrl = 'https://www.managelm.com/doc/';

	properties: INodeProperties[] = [
		{
			displayName: 'Secret',
			name: 'secret',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'The HMAC secret set on the ManageLM webhook (Settings > MCP & API > Webhooks)',
		},
	];
}
