import type {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ManageLmApi implements ICredentialType {
	name = 'manageLmApi';
	displayName = 'ManageLM API';
	documentationUrl = 'https://www.managelm.com/doc/';

	properties: INodeProperties[] = [
		{
			displayName: 'Portal URL',
			name: 'portalUrl',
			type: 'string',
			default: 'https://app.managelm.com',
			placeholder: 'https://app.managelm.com',
			description: 'Base URL of your ManageLM portal (no trailing slash)',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'mlm_ak_...',
			description: 'API key created in Portal > Settings > API Keys',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};
}
