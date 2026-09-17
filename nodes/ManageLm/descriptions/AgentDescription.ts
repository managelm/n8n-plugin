import type { INodeProperties } from 'n8n-workflow';

export const agentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['agent'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get details of an agent', action: 'Get an agent' },
			{ name: 'Get Many', value: 'getAll', description: 'List the agents you can access', action: 'List agents' },
			{ name: 'Get Skills', value: 'getSkills', description: 'List the skills assigned to an agent', action: 'Get agent skills' },
		],
		default: 'getAll',
	},
];

export const agentFields: INodeProperties[] = [
	{
		displayName: 'Agent ID',
		name: 'agentId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the agent',
		displayOptions: { show: { resource: ['agent'], operation: ['get', 'getSkills'] } },
	},
];
