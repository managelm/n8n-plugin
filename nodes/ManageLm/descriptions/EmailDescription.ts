import type { INodeProperties } from 'n8n-workflow';

export const emailOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['email'] } },
		options: [
			{ name: 'Send', value: 'send', description: 'Send an email to the authenticated user', action: 'Send email' },
		],
		default: 'send',
	},
];

export const emailFields: INodeProperties[] = [
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		required: true,
		default: '',
		description: 'Email subject line',
		displayOptions: { show: { resource: ['email'], operation: ['send'] } },
	},
	{
		displayName: 'Body',
		name: 'body',
		type: 'string',
		typeOptions: { rows: 6 },
		required: true,
		default: '',
		description: 'Email body in plain text',
		displayOptions: { show: { resource: ['email'], operation: ['send'] } },
	},
];
