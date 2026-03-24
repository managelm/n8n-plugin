import type { INodeProperties } from 'n8n-workflow';

export const searchOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['search'] } },
		options: [
			{ name: 'Agents', value: 'agents', description: 'Search agents by health, OS, status, group, or text', action: 'Search agents' },
			{ name: 'Inventory', value: 'inventory', description: 'Search installed packages, services, containers across agents', action: 'Search inventory' },
			{ name: 'Security', value: 'security', description: 'Search security audit findings across agents', action: 'Search security findings' },
			{ name: 'SSH Keys', value: 'sshKeys', description: 'Search SSH keys across infrastructure', action: 'Search SSH keys' },
			{ name: 'Sudo Rules', value: 'sudoRules', description: 'Search sudo privileges across infrastructure', action: 'Search sudo rules' },
		],
		default: 'agents',
	},
];

export const searchFields: INodeProperties[] = [
	// ------ Common: query ------
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		default: '',
		description: 'Free-text search',
		displayOptions: { show: { resource: ['search'] } },
	},
	// ------ Common: group ------
	{
		displayName: 'Group',
		name: 'group',
		type: 'string',
		default: '',
		description: 'Filter by server group name',
		displayOptions: { show: { resource: ['search'] } },
	},

	// ------ Agents: health filters ------
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Online', value: 'online' },
			{ name: 'Offline', value: 'offline' },
		],
		default: '',
		description: 'Filter by agent status',
		displayOptions: { show: { resource: ['search'], operation: ['agents'] } },
	},
	{
		displayName: 'CPU Above %',
		name: 'cpuAbove',
		type: 'number',
		default: 0,
		description: 'Only agents with CPU usage above this percentage (0 = no filter)',
		displayOptions: { show: { resource: ['search'], operation: ['agents'] } },
	},
	{
		displayName: 'Memory Above %',
		name: 'memoryAbove',
		type: 'number',
		default: 0,
		description: 'Only agents with memory usage above this percentage (0 = no filter)',
		displayOptions: { show: { resource: ['search'], operation: ['agents'] } },
	},
	{
		displayName: 'Disk Above %',
		name: 'diskAbove',
		type: 'number',
		default: 0,
		description: 'Only agents with disk usage above this percentage (0 = no filter)',
		displayOptions: { show: { resource: ['search'], operation: ['agents'] } },
	},

	// ------ Inventory: category + status ------
	{
		displayName: 'Category',
		name: 'category',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Service', value: 'service' },
			{ name: 'Package', value: 'package' },
			{ name: 'Container', value: 'container' },
			{ name: 'Network', value: 'network' },
			{ name: 'Storage', value: 'storage' },
			{ name: 'Hardware', value: 'hardware' },
			{ name: 'Other', value: 'other' },
		],
		default: '',
		description: 'Filter by inventory category',
		displayOptions: { show: { resource: ['search'], operation: ['inventory'] } },
	},
	{
		displayName: 'Item Status',
		name: 'itemStatus',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Running', value: 'running' },
			{ name: 'Stopped', value: 'stopped' },
			{ name: 'Installed', value: 'installed' },
		],
		default: '',
		description: 'Filter by item status',
		displayOptions: { show: { resource: ['search'], operation: ['inventory'] } },
	},

	// ------ Security: severity + category ------
	{
		displayName: 'Severity',
		name: 'severity',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Critical', value: 'critical' },
			{ name: 'High', value: 'high' },
			{ name: 'Medium', value: 'medium' },
			{ name: 'Low', value: 'low' },
		],
		default: '',
		description: 'Minimum severity (includes this level and above)',
		displayOptions: { show: { resource: ['search'], operation: ['security'] } },
	},
	{
		displayName: 'Finding Category',
		name: 'findingCategory',
		type: 'string',
		default: '',
		placeholder: 'SSH, Firewall, TLS, Users, Ports...',
		description: 'Filter by finding category',
		displayOptions: { show: { resource: ['search'], operation: ['security'] } },
	},

	// ------ SSH Keys: user + unknown_only ------
	{
		displayName: 'User',
		name: 'user',
		type: 'string',
		default: '',
		description: 'Filter by ManageLM user name or email',
		displayOptions: { show: { resource: ['search'], operation: ['sshKeys', 'sudoRules'] } },
	},
	{
		displayName: 'Unknown Only',
		name: 'unknownOnly',
		type: 'boolean',
		default: false,
		description: 'Whether to only show keys not matched to a ManageLM user',
		displayOptions: { show: { resource: ['search'], operation: ['sshKeys'] } },
	},

	// ------ Sudo Rules: nopasswd_only ------
	{
		displayName: 'NOPASSWD Only',
		name: 'nopasswdOnly',
		type: 'boolean',
		default: false,
		description: 'Whether to only show NOPASSWD sudo rules',
		displayOptions: { show: { resource: ['search'], operation: ['sudoRules'] } },
	},
];
