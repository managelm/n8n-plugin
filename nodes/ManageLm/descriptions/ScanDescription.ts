import type { INodeProperties } from 'n8n-workflow';

/**
 * The five agent scans. One resource with a type selector, because they are the
 * same mechanism on the portal: POST /api/<path>/:agentId starts one (202), and
 * GET on the same path returns the latest result once its status leaves
 * "running". The value is the portal route segment.
 */
const SCAN_TYPES = [
	{ name: 'Access (SSH Keys & Sudo)', value: 'sshkeys' },
	{ name: 'Activity (Last 24h)', value: 'activity' },
	{ name: 'Certificates', value: 'certscan' },
	{ name: 'Inventory', value: 'inventory' },
	{ name: 'Security Audit', value: 'security' },
];

export const scanOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['scan'] } },
		options: [
			{ name: 'Get Result', value: 'get', description: 'Get the latest scan result of an agent', action: 'Get a scan result' },
			{ name: 'Start', value: 'trigger', description: 'Start a scan on an agent (requires the Reports permission)', action: 'Start a scan' },
		],
		default: 'get',
	},
];

export const scanFields: INodeProperties[] = [
	{
		displayName: 'Scan Type',
		name: 'scanType',
		type: 'options',
		options: SCAN_TYPES,
		default: 'security',
		displayOptions: { show: { resource: ['scan'] } },
	},
	{
		displayName: 'Agent ID',
		name: 'agentId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the agent',
		displayOptions: { show: { resource: ['scan'] } },
	},
];
