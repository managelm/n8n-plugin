import type { INodeProperties } from 'n8n-workflow';

export const taskOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['task'] } },
		options: [
			{ name: 'Get', value: 'get', description: 'Get status of a task', action: 'Get a task' },
			{ name: 'Get Changes', value: 'getChanges', description: 'View file changes made by a task', action: 'Get task changes' },
			{ name: 'Get Many', value: 'getAll', description: 'List tasks', action: 'List tasks' },
			{ name: 'Revert', value: 'revert', description: 'Revert file changes from a task', action: 'Revert a task' },
			{ name: 'Submit', value: 'submit', description: 'Submit a task (run a skill on a server)', action: 'Submit a task' },
		],
		default: 'submit',
	},
];

export const taskFields: INodeProperties[] = [
	// ------ Submit ------
	{
		displayName: 'Agent ID',
		name: 'agentId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the agent to run the task on',
		displayOptions: { show: { resource: ['task'], operation: ['submit'] } },
	},
	{
		displayName: 'Skill',
		name: 'skillSlug',
		type: 'string',
		required: true,
		default: 'base',
		placeholder: 'e.g. base, packages, services, security',
		description: 'Slug of the skill to execute',
		displayOptions: { show: { resource: ['task'], operation: ['submit'] } },
	},
	{
		displayName: 'Instruction',
		name: 'instruction',
		type: 'string',
		typeOptions: { rows: 4 },
		required: true,
		default: '',
		placeholder: 'e.g. Show disk usage on all mounted filesystems',
		description: 'Free-text instruction describing what the skill should do',
		displayOptions: { show: { resource: ['task'], operation: ['submit'] } },
	},
	{
		displayName: 'Wait for Completion',
		name: 'wait',
		type: 'boolean',
		default: true,
		description: 'Whether to wait for the task to complete before returning',
		displayOptions: { show: { resource: ['task'], operation: ['submit'] } },
	},

	// ------ Get / Get Changes / Revert ------
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the task',
		displayOptions: { show: { resource: ['task'], operation: ['get', 'getChanges', 'revert'] } },
	},
	{
		displayName: 'Full Diff',
		name: 'fullDiff',
		type: 'boolean',
		default: false,
		description: 'Whether to fetch the full unified diff from the agent (requires agent online)',
		displayOptions: { show: { resource: ['task'], operation: ['getChanges'] } },
	},

	// ------ Get Many ------
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['task'], operation: ['getAll'] } },
		options: [
			{
				displayName: 'Agent ID',
				name: 'agent_id',
				type: 'string',
				default: '',
				description: 'Filter by agent',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Answered', value: 'answered' },
					{ name: 'Completed', value: 'completed' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Needs Input', value: 'needs_input' },
					{ name: 'Pending', value: 'pending' },
					{ name: 'Running', value: 'running' },
				],
				default: '',
				description: 'Filter by task status',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 25,
				description: 'Max number of tasks to return',
			},
		],
	},
];
