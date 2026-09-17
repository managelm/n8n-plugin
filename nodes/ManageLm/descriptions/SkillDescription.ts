import type { INodeProperties } from 'n8n-workflow';

export const skillOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['skill'] } },
		options: [
			{ name: 'Get Catalog', value: 'catalog', description: 'List the built-in skill catalog, with what is already imported', action: 'Get the skill catalog' },
			{ name: 'Get Many', value: 'getAll', description: 'List the skills in your account', action: 'List skills' },
		],
		default: 'getAll',
	},
];

export const skillFields: INodeProperties[] = [];
