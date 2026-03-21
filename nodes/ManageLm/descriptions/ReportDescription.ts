import type { INodeProperties } from 'n8n-workflow';

export const reportOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['report'] } },
		options: [
			{ name: 'Export PDF', value: 'exportPdf', description: 'Export operations report as PDF', action: 'Export report PDF' },
			{ name: 'Get Many', value: 'getAll', description: 'List completed operations', action: 'List report entries' },
		],
		default: 'getAll',
	},
];

export const reportFields: INodeProperties[] = [
	// ------ Date range (both operations) ------
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'YYYY-MM-DD',
		description: 'Start date for the report range',
		displayOptions: { show: { resource: ['report'], operation: ['getAll', 'exportPdf'] } },
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'YYYY-MM-DD',
		description: 'End date for the report range',
		displayOptions: { show: { resource: ['report'], operation: ['getAll', 'exportPdf'] } },
	},

	// ------ Filters ------
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['report'], operation: ['getAll', 'exportPdf'] } },
		options: [
			{
				displayName: 'Agent ID',
				name: 'agent_id',
				type: 'string',
				default: '',
				description: 'Filter by agent',
			},
			{
				displayName: 'Mutating Only',
				name: 'mutating_only',
				type: 'boolean',
				default: true,
				description: 'Whether to show only mutating operations',
			},
		],
	},

	// ------ List-specific: pagination ------
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 500 },
		default: 50,
		description: 'Max number of entries to return',
		displayOptions: { show: { resource: ['report'], operation: ['getAll'] } },
	},
];
