import type { INodeProperties } from 'n8n-workflow';

export const apiKeyOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['apiKey'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create an API key', action: 'Create an API key' },
			{ name: 'Delete', value: 'delete', description: 'Revoke an API key', action: 'Delete an API key' },
			{ name: 'Get Many', value: 'getAll', description: 'List API keys', action: 'List API keys' },
		],
		default: 'getAll',
	},
];

export const apiKeyFields: INodeProperties[] = [
	// ------ Create ------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. n8n-automation',
		description: 'Name for the API key',
		displayOptions: { show: { resource: ['apiKey'], operation: ['create'] } },
	},
	{
		displayName: 'Permissions',
		name: 'permissions',
		type: 'collection',
		placeholder: 'Add Permission',
		default: {},
		displayOptions: { show: { resource: ['apiKey'], operation: ['create'] } },
		options: [
			{
				displayName: 'Agents',
				name: 'agents',
				type: 'boolean',
				default: true,
				description: 'Whether the key can manage agents and tasks',
			},
			{
				displayName: 'Skills',
				name: 'skills',
				type: 'boolean',
				default: false,
				description: 'Whether the key can manage skills',
			},
			{
				displayName: 'Groups',
				name: 'groups',
				type: 'boolean',
				default: false,
				description: 'Whether the key can manage groups',
			},
			{
				displayName: 'Logs',
				name: 'logs',
				type: 'boolean',
				default: true,
				description: 'Whether the key can view task logs',
			},
			{
				displayName: 'Reports',
				name: 'reports',
				type: 'boolean',
				default: false,
				description: 'Whether the key can generate reports',
			},
		],
	},
	{
		displayName: 'Expires In Days',
		name: 'expiresInDays',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 365 },
		default: 0,
		description: 'Number of days until the key expires (0 = no expiry)',
		displayOptions: { show: { resource: ['apiKey'], operation: ['create'] } },
	},

	// ------ Delete ------
	{
		displayName: 'API Key ID',
		name: 'apiKeyId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the API key to revoke',
		displayOptions: { show: { resource: ['apiKey'], operation: ['delete'] } },
	},
];
