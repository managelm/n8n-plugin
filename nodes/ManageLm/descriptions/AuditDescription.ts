import type { INodeProperties } from 'n8n-workflow';

export const auditOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['audit'] } },
		options: [
			{ name: 'Get Many', value: 'getAll', description: 'List audit log entries', action: 'List audit entries' },
		],
		default: 'getAll',
	},
];

export const auditFields: INodeProperties[] = [
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['audit'], operation: ['getAll'] } },
		options: [
			{
				displayName: 'Action',
				name: 'action',
				type: 'string',
				default: '',
				placeholder: 'e.g. agent.approve, task.submit',
				description: 'Filter by action type',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 500 },
				default: 100,
				description: 'Max number of entries to return',
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				typeOptions: { minValue: 0 },
				default: 0,
				description: 'Number of entries to skip',
			},
		],
	},
];
