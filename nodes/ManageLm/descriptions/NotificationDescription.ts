import type { INodeProperties } from 'n8n-workflow';

export const notificationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['notification'] } },
		options: [
			{ name: 'Clear', value: 'clear', description: 'Clear read notifications', action: 'Clear notifications' },
			{ name: 'Get Many', value: 'getAll', description: 'List recent notifications', action: 'List notifications' },
			{ name: 'Mark as Read', value: 'markRead', description: 'Mark notifications as read', action: 'Mark notifications read' },
		],
		default: 'getAll',
	},
];

export const notificationFields: INodeProperties[] = [
	// ------ Mark as Read: optional IDs ------
	{
		displayName: 'Notification IDs',
		name: 'notificationIds',
		type: 'string',
		default: '',
		placeholder: 'id1, id2 (leave empty for all)',
		description: 'Comma-separated notification IDs to mark as read. Leave empty to mark all.',
		displayOptions: { show: { resource: ['notification'], operation: ['markRead'] } },
	},
];
