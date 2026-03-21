import type { INodeProperties } from 'n8n-workflow';

export const groupOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['group'] } },
		options: [
			{ name: 'Add Agents', value: 'addAgents', description: 'Add agents to a group (append)', action: 'Add agents to group' },
			{ name: 'Create', value: 'create', description: 'Create a group', action: 'Create a group' },
			{ name: 'Delete', value: 'delete', description: 'Delete a group', action: 'Delete a group' },
			{ name: 'Get Agents', value: 'getAgents', description: 'List agents in a group', action: 'Get group agents' },
			{ name: 'Get Many', value: 'getAll', description: 'List all groups', action: 'List all groups' },
			{ name: 'Get Members', value: 'getMembers', description: 'List members with access to a group', action: 'Get group members' },
			{ name: 'Set Agents', value: 'setAgents', description: 'Set agents in a group (replace)', action: 'Set agents in a group' },
			{ name: 'Set Members', value: 'setMembers', description: 'Set member access for a group', action: 'Set group members' },
			{ name: 'Set Skills', value: 'setSkills', description: 'Set skills for a group', action: 'Set skills for a group' },
			{ name: 'Update', value: 'update', description: 'Update a group', action: 'Update a group' },
		],
		default: 'getAll',
	},
];

export const groupFields: INodeProperties[] = [
	// ------ Group ID (most operations) ------
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the group',
		displayOptions: {
			show: { resource: ['group'], operation: ['update', 'delete', 'setAgents', 'addAgents', 'getAgents', 'setSkills', 'getMembers', 'setMembers'] },
		},
	},

	// ------ Create ------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Name of the new group',
		displayOptions: { show: { resource: ['group'], operation: ['create'] } },
	},

	// ------ Update ------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		description: 'New name for the group',
		displayOptions: { show: { resource: ['group'], operation: ['update'] } },
	},

	// ------ Set Agents (replace) ------
	{
		displayName: 'Agent IDs',
		name: 'agentIds',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'id1, id2, id3',
		description: 'Comma-separated list of agent IDs to assign to the group',
		displayOptions: { show: { resource: ['group'], operation: ['setAgents', 'addAgents'] } },
	},

	// ------ Set Skills ------
	{
		displayName: 'Skill IDs',
		name: 'skillIds',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'id1, id2, id3',
		description: 'Comma-separated list of skill IDs to assign to the group',
		displayOptions: { show: { resource: ['group'], operation: ['setSkills'] } },
	},

	// ------ Set Members ------
	{
		displayName: 'User IDs',
		name: 'userIds',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'id1, id2, id3',
		description: 'Comma-separated list of user IDs to grant access',
		displayOptions: { show: { resource: ['group'], operation: ['setMembers'] } },
	},
];
