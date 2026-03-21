import type { INodeProperties } from 'n8n-workflow';

export const securityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['security'] } },
		options: [
			{ name: 'Export PDF', value: 'exportPdf', description: 'Export infrastructure-wide security report as PDF', action: 'Export security PDF' },
			{ name: 'Get Audit', value: 'get', description: 'Get latest security audit for an agent', action: 'Get security audit' },
			{ name: 'Remediate', value: 'remediate', description: 'Create a remediation task for findings', action: 'Remediate security findings' },
			{ name: 'Trigger Audit', value: 'trigger', description: 'Start a security audit on an agent', action: 'Trigger security audit' },
		],
		default: 'get',
	},
];

export const securityFields: INodeProperties[] = [
	// ------ Agent ID (get, trigger, remediate) ------
	{
		displayName: 'Agent ID',
		name: 'agentId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the agent',
		displayOptions: {
			show: { resource: ['security'], operation: ['get', 'trigger', 'remediate'] },
		},
	},

	// ------ Remediate: finding IDs ------
	{
		displayName: 'Finding IDs',
		name: 'findingIds',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'id1, id2',
		description: 'Comma-separated list of finding IDs to remediate',
		displayOptions: { show: { resource: ['security'], operation: ['remediate'] } },
	},

	// ------ Export PDF: timezone ------
	{
		displayName: 'Timezone',
		name: 'timezone',
		type: 'string',
		default: 'UTC',
		description: 'Timezone for the report (e.g. Europe/Paris)',
		displayOptions: { show: { resource: ['security'], operation: ['exportPdf'] } },
	},
];
