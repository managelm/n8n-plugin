import type { INodeProperties } from 'n8n-workflow';

export const agentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['agent'] } },
		options: [
			{ name: 'Approve', value: 'approve', description: 'Approve a pending agent', action: 'Approve an agent' },
			{ name: 'Assign Skill', value: 'assignSkill', description: 'Assign a skill to an agent', action: 'Assign skill to agent' },
			{ name: 'Delete', value: 'delete', description: 'Delete an agent', action: 'Delete an agent' },
			{ name: 'Get', value: 'get', description: 'Get a single agent', action: 'Get an agent' },
			{ name: 'Get Many', value: 'getAll', description: 'List all agents', action: 'List all agents' },
			{ name: 'Get Metrics', value: 'getMetrics', description: 'Get 24h health metrics for an agent', action: 'Get agent metrics' },
			{ name: 'Get Skills', value: 'getSkills', description: 'List skills assigned to an agent', action: 'Get agent skills' },
			{ name: 'Get Stats', value: 'getStats', description: 'Get agent statistics dashboard', action: 'Get agent stats' },
			{ name: 'Remove Skill', value: 'removeSkill', description: 'Remove a skill from an agent', action: 'Remove skill from agent' },
			{ name: 'Update', value: 'update', description: 'Update agent settings', action: 'Update an agent' },
		],
		default: 'getAll',
	},
];

export const agentFields: INodeProperties[] = [
	// ------ Agent ID (for single-agent operations) ------
	{
		displayName: 'Agent ID',
		name: 'agentId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the agent',
		displayOptions: {
			show: { resource: ['agent'], operation: ['get', 'getMetrics', 'approve', 'delete', 'update', 'getSkills', 'assignSkill', 'removeSkill'] },
		},
	},

	// ------ Update fields ------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['agent'], operation: ['update'] } },
		options: [
			{
				displayName: 'Display Name',
				name: 'display_name',
				type: 'string',
				default: '',
				description: 'Display name for the agent',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				placeholder: 'web, production, eu-west',
				description: 'Comma-separated list of tags',
			},
			{
				displayName: 'Auto Update',
				name: 'auto_update',
				type: 'boolean',
				default: true,
				description: 'Whether the agent should auto-update',
			},
			{
				displayName: 'LLM API URL',
				name: 'llm_api_url',
				type: 'string',
				default: '',
				description: 'Custom LLM API URL for this agent',
			},
			{
				displayName: 'LLM API Key',
				name: 'llm_api_key',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Custom LLM API key for this agent',
			},
			{
				displayName: 'LLM Model',
				name: 'llm_model',
				type: 'string',
				default: '',
				description: 'Custom LLM model for this agent',
			},
			{
				displayName: 'Audit Schedule',
				name: 'audit_schedule',
				type: 'options',
				options: [
					{ name: 'None', value: '' },
					{ name: 'Daily', value: 'daily' },
					{ name: 'Weekly', value: 'weekly' },
					{ name: 'Monthly', value: 'monthly' },
				],
				default: '',
				description: 'Security audit schedule',
			},
			{
				displayName: 'Inventory Schedule',
				name: 'inventory_schedule',
				type: 'options',
				options: [
					{ name: 'None', value: '' },
					{ name: 'Daily', value: 'daily' },
					{ name: 'Weekly', value: 'weekly' },
					{ name: 'Monthly', value: 'monthly' },
				],
				default: '',
				description: 'Inventory scan schedule',
			},
			{
				displayName: 'Group IDs',
				name: 'group_ids',
				type: 'string',
				default: '',
				placeholder: 'id1, id2',
				description: 'Comma-separated list of group IDs to assign',
			},
		],
	},

	// ------ Assign Skill ------
	{
		displayName: 'Skill ID',
		name: 'skillId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the skill to assign',
		displayOptions: { show: { resource: ['agent'], operation: ['assignSkill', 'removeSkill'] } },
	},

	// ------ Assign Skill optional fields ------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['agent'], operation: ['assignSkill'] } },
		options: [
			{
				displayName: 'LLM Model Override',
				name: 'llm_model',
				type: 'string',
				default: '',
				description: 'Override the LLM model for this skill on this agent',
			},
		],
	},
];
