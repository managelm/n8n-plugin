import type { INodeProperties } from 'n8n-workflow';

export const accountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['account'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get the account and its team members', action: 'Get the account' },
			{ name: 'Get Groups', value: 'getGroups', description: 'List server groups', action: 'List groups' },
			{ name: 'Get Sites', value: 'getSites', description: 'List sites', action: 'List sites' },
		],
		default: 'get',
	},
];

export const accountFields: INodeProperties[] = [];
