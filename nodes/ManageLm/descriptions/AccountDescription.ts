import type { INodeProperties } from 'n8n-workflow';

export const accountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['account'] } },
		options: [
			{ name: 'Get Info', value: 'get', description: 'Get account info with users and permissions', action: 'Get account info' },
			{ name: 'Invite User', value: 'invite', description: 'Invite a user to the account', action: 'Invite user' },
			{ name: 'Update', value: 'update', description: 'Update account settings', action: 'Update account' },
		],
		default: 'get',
	},
];

export const accountFields: INodeProperties[] = [
	// ------ Update fields ------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['account'], operation: ['update'] } },
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Account name',
			},
			{
				displayName: 'Audit Report Schedule',
				name: 'audit_report_schedule',
				type: 'options',
				options: [
					{ name: 'None', value: '' },
					{ name: 'Daily', value: 'daily' },
					{ name: 'Weekly', value: 'weekly' },
					{ name: 'Monthly', value: 'monthly' },
				],
				default: '',
				description: 'Schedule for automatic security audit reports',
			},
			{
				displayName: 'Inventory Report Schedule',
				name: 'inventory_report_schedule',
				type: 'options',
				options: [
					{ name: 'None', value: '' },
					{ name: 'Daily', value: 'daily' },
					{ name: 'Weekly', value: 'weekly' },
					{ name: 'Monthly', value: 'monthly' },
				],
				default: '',
				description: 'Schedule for automatic inventory reports',
			},
		],
	},

	// ------ Invite fields ------
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@example.com',
		required: true,
		default: '',
		description: 'Email address of the user to invite',
		displayOptions: { show: { resource: ['account'], operation: ['invite'] } },
	},
	{
		displayName: 'Role',
		name: 'role',
		type: 'options',
		options: [
			{ name: 'Admin', value: 'admin' },
			{ name: 'Member', value: 'member' },
		],
		default: 'member',
		description: 'Role for the invited user',
		displayOptions: { show: { resource: ['account'], operation: ['invite'] } },
	},
	{
		displayName: 'Permissions',
		name: 'permissions',
		type: 'collection',
		placeholder: 'Add Permission',
		default: {},
		displayOptions: { show: { resource: ['account'], operation: ['invite'] } },
		options: [
			{
				displayName: 'Agents',
				name: 'perm_agents',
				type: 'boolean',
				default: false,
				description: 'Whether the user can manage agents',
			},
			{
				displayName: 'Groups',
				name: 'perm_groups',
				type: 'boolean',
				default: false,
				description: 'Whether the user can manage groups',
			},
			{
				displayName: 'Skills',
				name: 'perm_skills',
				type: 'boolean',
				default: false,
				description: 'Whether the user can manage skills',
			},
			{
				displayName: 'Logs',
				name: 'perm_logs',
				type: 'boolean',
				default: false,
				description: 'Whether the user can view task logs',
			},
			{
				displayName: 'Reports',
				name: 'perm_reports',
				type: 'boolean',
				default: false,
				description: 'Whether the user can generate reports',
			},
		],
	},
];
