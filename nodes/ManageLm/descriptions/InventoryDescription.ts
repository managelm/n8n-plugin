import type { INodeProperties } from 'n8n-workflow';

export const inventoryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['inventory'] } },
		options: [
			{ name: 'Export PDF', value: 'exportPdf', description: 'Export infrastructure-wide inventory report as PDF', action: 'Export inventory PDF' },
			{ name: 'Get Report', value: 'get', description: 'Get system inventory for an agent', action: 'Get inventory report' },
			{ name: 'Trigger Scan', value: 'trigger', description: 'Start an inventory scan on an agent', action: 'Trigger inventory scan' },
		],
		default: 'get',
	},
];

export const inventoryFields: INodeProperties[] = [
	// ------ Agent ID (get, trigger) ------
	{
		displayName: 'Agent ID',
		name: 'agentId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the agent',
		displayOptions: {
			show: { resource: ['inventory'], operation: ['get', 'trigger'] },
		},
	},

	// ------ Export PDF: timezone ------
	{
		displayName: 'Timezone',
		name: 'timezone',
		type: 'string',
		default: 'UTC',
		description: 'Timezone for the report (e.g. Europe/Paris)',
		displayOptions: { show: { resource: ['inventory'], operation: ['exportPdf'] } },
	},
];
