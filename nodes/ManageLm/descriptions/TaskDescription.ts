import type { INodeProperties } from 'n8n-workflow';

export const taskOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['task'] } },
		options: [
			{ name: 'Answer', value: 'answer', description: 'Answer the question of a task waiting for input', action: 'Answer a task' },
			{ name: 'Follow Up', value: 'followUp', description: 'Continue the conversation of a completed task', action: 'Follow up on a task' },
			{ name: 'Get', value: 'get', description: 'Get status and result of a task', action: 'Get a task' },
			{ name: 'Get Changes', value: 'getChanges', description: 'View file changes made by a task', action: 'Get task changes' },
			{ name: 'Get Many', value: 'getAll', description: 'List tasks', action: 'List tasks' },
			{ name: 'Revert', value: 'revert', description: 'Revert file changes from a task', action: 'Revert a task' },
			{ name: 'Submit', value: 'submit', description: 'Submit a task (run a skill on a server)', action: 'Submit a task' },
		],
		default: 'submit',
	},
];

/** Operations that dispatch to the agent and can wait for the outcome. */
const WAITING_OPS = ['submit', 'answer', 'followUp'];

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
		placeholder: 'e.g. base, packages, services, security, auto',
		description: 'Slug of the skill to execute, or "auto" to let the agent pick one',
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
		displayOptions: { show: { resource: ['task'], operation: ['submit', 'followUp'] } },
	},

	// ------ Answer ------
	{
		displayName: 'Answer',
		name: 'answer',
		type: 'string',
		typeOptions: { rows: 2 },
		required: true,
		default: '',
		description: 'Answer to the question the task asked',
		displayOptions: { show: { resource: ['task'], operation: ['answer'] } },
	},

	// ------ Waiting (Submit / Answer / Follow Up) ------
	{
		displayName: 'Wait for Completion',
		name: 'wait',
		type: 'boolean',
		default: true,
		description: 'Whether to wait for the task to finish before returning. If it is still running after Max Wait, the task ID is returned with still_running: true — use Get to poll it.',
		displayOptions: { show: { resource: ['task'], operation: WAITING_OPS } },
	},
	{
		displayName: 'Max Wait (Seconds)',
		name: 'waitSeconds',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 300 },
		default: 120,
		description: 'Longest time to wait for the task. Keep it below your n8n HTTP timeout.',
		displayOptions: { show: { resource: ['task'], operation: WAITING_OPS, wait: [true] } },
	},

	// ------ Get / Get Changes / Revert / Answer / Follow Up ------
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the task',
		displayOptions: { show: { resource: ['task'], operation: ['get', 'getChanges', 'revert', 'answer', 'followUp'] } },
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
					{ name: 'Sent (Running)', value: 'sent' },
					{ name: 'Timeout', value: 'timeout' },
				],
				default: 'completed',
				description: 'Filter by task status',
			},
			{
				displayName: 'Since',
				name: 'since',
				type: 'dateTime',
				default: '',
				description: 'Only tasks created at or after this time',
			},
			{
				displayName: 'Until',
				name: 'until',
				type: 'dateTime',
				default: '',
				description: 'Only tasks created before this time',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 500 },
				default: 50,
				description: 'Max number of results to return',
			},
		],
	},
];
