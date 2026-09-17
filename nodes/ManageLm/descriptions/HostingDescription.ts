import type { INodeProperties } from 'n8n-workflow';

export const hostingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['hosting'] } },
		options: [
			{ name: 'Get Actions', value: 'getActions', description: 'List the actions a hosting connector allows', action: 'Get connector actions' },
			{ name: 'Run Action', value: 'runAction', description: 'Start, stop, reboot or snapshot a VM (requires the Hosting permission). Runs immediately, without confirmation, including disruptive actions such as stop, shutdown and reboot.', action: 'Run a hosting action' },
		],
		default: 'getActions',
	},
];

export const hostingFields: INodeProperties[] = [
	{
		displayName: 'Connector ID',
		name: 'connectorId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the hosting connector (connector_id in Search > Cloud Resources)',
		displayOptions: { show: { resource: ['hosting'] } },
	},
	{
		displayName: 'Resource ID',
		name: 'resourceId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the VM (id in Search > Cloud Resources)',
		displayOptions: { show: { resource: ['hosting'], operation: ['runAction'] } },
	},
	{
		displayName: 'Action',
		name: 'action',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. vm.start, vm.shutdown, vm.reboot, vm.snapshot.create',
		description: 'Action ID, as returned by Get Actions. It runs as soon as the node executes, with no confirmation step, even for a stop, shutdown or reboot.',
		displayOptions: { show: { resource: ['hosting'], operation: ['runAction'] } },
	},
	{
		displayName: 'Parameters (JSON)',
		name: 'params',
		type: 'json',
		default: '{}',
		description: 'Action parameters, e.g. {"name": "before-upgrade"} for a snapshot',
		displayOptions: { show: { resource: ['hosting'], operation: ['runAction'] } },
	},
];
