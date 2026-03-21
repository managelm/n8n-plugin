import type { INodeProperties } from 'n8n-workflow';

export const dependencyOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['dependency'] } },
		options: [
			{ name: 'Get Results', value: 'getResults', description: 'Get results of a dependency scan', action: 'Get scan results' },
			{ name: 'Trigger Scan', value: 'scan', description: 'Trigger a dependency scan on all online agents', action: 'Trigger dependency scan' },
		],
		default: 'scan',
	},
];

export const dependencyFields: INodeProperties[] = [
	// ------ Get Results: scan ID ------
	{
		displayName: 'Scan ID',
		name: 'scanId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the scan to retrieve results for',
		displayOptions: { show: { resource: ['dependency'], operation: ['getResults'] } },
	},
];
