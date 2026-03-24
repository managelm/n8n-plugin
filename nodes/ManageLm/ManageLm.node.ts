import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { manageLmApiRequest } from './GenericFunctions';

import { agentOperations, agentFields } from './descriptions/AgentDescription';
import { taskOperations, taskFields } from './descriptions/TaskDescription';
import { skillOperations, skillFields } from './descriptions/SkillDescription';
import { groupOperations, groupFields } from './descriptions/GroupDescription';
import { securityOperations, securityFields } from './descriptions/SecurityDescription';
import { inventoryOperations, inventoryFields } from './descriptions/InventoryDescription';
import { accountOperations, accountFields } from './descriptions/AccountDescription';
import { auditOperations, auditFields } from './descriptions/AuditDescription';
import { notificationOperations, notificationFields } from './descriptions/NotificationDescription';
import { reportOperations, reportFields } from './descriptions/ReportDescription';
import { apiKeyOperations, apiKeyFields } from './descriptions/ApiKeyDescription';
import { dependencyOperations, dependencyFields } from './descriptions/DependencyDescription';
import { searchOperations, searchFields } from './descriptions/SearchDescription';
import { emailOperations, emailFields } from './descriptions/EmailDescription';

export class ManageLm implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ManageLM',
		name: 'manageLm',
		icon: 'file:managelm.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Manage Linux servers through ManageLM',
		defaults: { name: 'ManageLM' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'manageLmApi',
				required: true,
			},
		],
		properties: [
			// ------ Resource selector ------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Agent', value: 'agent' },
					{ name: 'API Key', value: 'apiKey' },
					{ name: 'Audit Log', value: 'audit' },
					{ name: 'Dependency', value: 'dependency' },
					{ name: 'Email', value: 'email' },
					{ name: 'Group', value: 'group' },
					{ name: 'Inventory', value: 'inventory' },
					{ name: 'Notification', value: 'notification' },
					{ name: 'Report', value: 'report' },
					{ name: 'Search', value: 'search' },
					{ name: 'Security', value: 'security' },
					{ name: 'Skill', value: 'skill' },
					{ name: 'Task', value: 'task' },
				],
				default: 'task',
			},
			// ------ Operations & fields per resource ------
			...agentOperations,
			...agentFields,
			...taskOperations,
			...taskFields,
			...skillOperations,
			...skillFields,
			...groupOperations,
			...groupFields,
			...securityOperations,
			...securityFields,
			...inventoryOperations,
			...inventoryFields,
			...accountOperations,
			...accountFields,
			...auditOperations,
			...auditFields,
			...notificationOperations,
			...notificationFields,
			...reportOperations,
			...reportFields,
			...apiKeyOperations,
			...apiKeyFields,
			...dependencyOperations,
			...dependencyFields,
			...searchOperations,
			...searchFields,
			...emailOperations,
			...emailFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: any;

				// ========== AGENT ==========
				if (resource === 'agent') {
					if (operation === 'getAll') {
						responseData = await manageLmApiRequest.call(this, 'GET', '/agents');
					} else if (operation === 'get') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'GET', `/agents/${agentId}`);
					} else if (operation === 'getMetrics') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'GET', `/agents/${agentId}/metrics`);
					} else if (operation === 'approve') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'POST', `/agents/${agentId}/approve`);
					} else if (operation === 'delete') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'DELETE', `/agents/${agentId}`);
					} else if (operation === 'update') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i, {}) as Record<string, any>;
						const body: Record<string, any> = {};
						// Copy simple fields
						for (const key of ['display_name', 'auto_update', 'llm_api_url', 'llm_api_key', 'llm_model', 'audit_schedule', 'inventory_schedule']) {
							if (updateFields[key] !== undefined && updateFields[key] !== '') {
								body[key] = key.endsWith('_schedule') && updateFields[key] === '' ? null : updateFields[key];
							}
						}
						// Convert comma-separated tags to array
						if (updateFields.tags) {
							body.tags = (updateFields.tags as string).split(',').map((t: string) => t.trim()).filter(Boolean);
						}
						// Convert comma-separated group_ids to array
						if (updateFields.group_ids) {
							body.group_ids = (updateFields.group_ids as string).split(',').map((id: string) => id.trim()).filter(Boolean);
						}
						responseData = await manageLmApiRequest.call(this, 'PATCH', `/agents/${agentId}`, body);
					} else if (operation === 'getSkills') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'GET', `/agents/${agentId}/skills`);
					} else if (operation === 'assignSkill') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						const skillId = this.getNodeParameter('skillId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as Record<string, any>;
						const body: Record<string, any> = { skill_id: skillId };
						if (additionalFields.llm_model) body.llm_model = additionalFields.llm_model;
						responseData = await manageLmApiRequest.call(this, 'POST', `/agents/${agentId}/skills`, body);
					} else if (operation === 'removeSkill') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						const skillId = this.getNodeParameter('skillId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'DELETE', `/agents/${agentId}/skills/${skillId}`);
					} else if (operation === 'getStats') {
						responseData = await manageLmApiRequest.call(this, 'GET', '/agents/stats');
					}
				}

				// ========== TASK ==========
				else if (resource === 'task') {
					if (operation === 'submit') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						const skillSlug = this.getNodeParameter('skillSlug', i) as string;
						const instruction = this.getNodeParameter('instruction', i) as string;
						const wait = this.getNodeParameter('wait', i) as boolean;

						const qs: Record<string, string | boolean> = {};
						if (wait) qs.wait = true;

						responseData = await manageLmApiRequest.call(
							this,
							'POST',
							'/tasks',
							{ agent_id: agentId, skill_slug: skillSlug, instruction },
							qs,
						);
					} else if (operation === 'get') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'GET', `/tasks/${taskId}`);
					} else if (operation === 'getAll') {
						const filters = this.getNodeParameter('filters', i, {}) as Record<string, any>;
						const qs: Record<string, string | number> = {};
						if (filters.agent_id) qs.agent_id = filters.agent_id;
						if (filters.status) qs.status = filters.status;
						if (filters.limit) qs.limit = filters.limit;
						responseData = await manageLmApiRequest.call(this, 'GET', '/tasks', {}, qs);
					} else if (operation === 'getChanges') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const fullDiff = this.getNodeParameter('fullDiff', i, false) as boolean;
						const qs: Record<string, string> = {};
						if (fullDiff) qs.full_diff = 'true';
						responseData = await manageLmApiRequest.call(this, 'GET', `/tasks/${taskId}/changes`, {}, qs);
					} else if (operation === 'revert') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'POST', `/tasks/${taskId}/revert`);
					}
				}

				// ========== SKILL ==========
				else if (resource === 'skill') {
					if (operation === 'getAll') {
						responseData = await manageLmApiRequest.call(this, 'GET', '/skills');
					} else if (operation === 'get') {
						const skillId = this.getNodeParameter('skillId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'GET', `/skills/${skillId}`);
					} else if (operation === 'catalog') {
						responseData = await manageLmApiRequest.call(this, 'GET', '/skills/catalog');
					} else if (operation === 'create') {
						const slug = this.getNodeParameter('slug', i) as string;
						const name = this.getNodeParameter('name', i) as string;
						const nodeType = this.getNodeParameter('nodeType', i) as string;
						const description = this.getNodeParameter('description', i) as string;
						const systemPrompt = this.getNodeParameter('systemPrompt', i) as string;
						const allowedCommands = (this.getNodeParameter('allowedCommands', i) as string)
							.split(',').map((c: string) => c.trim()).filter(Boolean);
						const operationsJson = this.getNodeParameter('operations', i) as string;

						let ops: Array<{ name: string; description: string }> = [];
						try {
							ops = JSON.parse(operationsJson || '[]');
						} catch {
							throw new NodeOperationError(this.getNode(), 'Operations must be valid JSON', { itemIndex: i });
						}

						responseData = await manageLmApiRequest.call(this, 'POST', '/skills', {
							slug,
							name,
							node_type: nodeType,
							description,
							skill_definition: {
								description,
								operations: ops,
								allowed_commands: allowedCommands,
								system_prompt: systemPrompt,
							},
						});
					} else if (operation === 'update') {
						const skillId = this.getNodeParameter('skillId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i, {}) as Record<string, any>;
						const body: Record<string, any> = {};
						if (updateFields.name) body.name = updateFields.name;
						if (updateFields.description) body.description = updateFields.description;
						if (updateFields.version) body.version = updateFields.version;

						// Build skill_definition if any definition fields are set
						const hasDef = updateFields.systemPrompt || updateFields.allowedCommands || updateFields.operations;
						if (hasDef) {
							const def: Record<string, any> = {};
							if (updateFields.systemPrompt) def.system_prompt = updateFields.systemPrompt;
							if (updateFields.allowedCommands) {
								def.allowed_commands = (updateFields.allowedCommands as string)
									.split(',').map((c: string) => c.trim()).filter(Boolean);
							}
							if (updateFields.operations) {
								try {
									def.operations = JSON.parse(updateFields.operations);
								} catch {
									throw new NodeOperationError(this.getNode(), 'Operations must be valid JSON', { itemIndex: i });
								}
							}
							if (updateFields.description) def.description = updateFields.description;
							body.skill_definition = def;
						}

						responseData = await manageLmApiRequest.call(this, 'PUT', `/skills/${skillId}`, body);
					} else if (operation === 'delete') {
						const skillId = this.getNodeParameter('skillId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'DELETE', `/skills/${skillId}`);
					} else if (operation === 'importCatalog') {
						const slugs = (this.getNodeParameter('slugs', i) as string)
							.split(',').map((s: string) => s.trim()).filter(Boolean);
						responseData = await manageLmApiRequest.call(this, 'POST', '/skills/catalog/import', { slugs });
					}
				}

				// ========== GROUP ==========
				else if (resource === 'group') {
					if (operation === 'getAll') {
						responseData = await manageLmApiRequest.call(this, 'GET', '/groups');
					} else if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						responseData = await manageLmApiRequest.call(this, 'POST', '/groups', { name });
					} else if (operation === 'update') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const name = this.getNodeParameter('name', i) as string;
						const body: Record<string, any> = {};
						if (name) body.name = name;
						responseData = await manageLmApiRequest.call(this, 'PATCH', `/groups/${groupId}`, body);
					} else if (operation === 'delete') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'DELETE', `/groups/${groupId}`);
					} else if (operation === 'getAgents') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'GET', `/groups/${groupId}/agents`);
					} else if (operation === 'setAgents') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const agentIds = (this.getNodeParameter('agentIds', i) as string)
							.split(',')
							.map((id) => id.trim())
							.filter(Boolean);
						responseData = await manageLmApiRequest.call(
							this, 'PUT', `/groups/${groupId}/agents`, { agent_ids: agentIds },
						);
					} else if (operation === 'addAgents') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const agentIds = (this.getNodeParameter('agentIds', i) as string)
							.split(',')
							.map((id) => id.trim())
							.filter(Boolean);
						responseData = await manageLmApiRequest.call(
							this, 'POST', `/groups/${groupId}/agents`, { agent_ids: agentIds },
						);
					} else if (operation === 'setSkills') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const skillIds = (this.getNodeParameter('skillIds', i) as string)
							.split(',')
							.map((id) => id.trim())
							.filter(Boolean);
						responseData = await manageLmApiRequest.call(
							this, 'PUT', `/groups/${groupId}/skills`, { skill_ids: skillIds },
						);
					} else if (operation === 'getMembers') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'GET', `/groups/${groupId}/members`);
					} else if (operation === 'setMembers') {
						const groupId = this.getNodeParameter('groupId', i) as string;
						const userIds = (this.getNodeParameter('userIds', i) as string)
							.split(',')
							.map((id) => id.trim())
							.filter(Boolean);
						responseData = await manageLmApiRequest.call(
							this, 'PUT', `/groups/${groupId}/members`, { user_ids: userIds },
						);
					}
				}

				// ========== SECURITY ==========
				else if (resource === 'security') {
					if (operation === 'get') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'GET', `/security/${agentId}`);
					} else if (operation === 'trigger') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'POST', `/security/${agentId}`);
					} else if (operation === 'remediate') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						const findingIds = (this.getNodeParameter('findingIds', i) as string)
							.split(',').map((id) => id.trim()).filter(Boolean);
						responseData = await manageLmApiRequest.call(
							this, 'POST', `/security/${agentId}/remediate`, { finding_ids: findingIds },
						);
					} else if (operation === 'exportPdf') {
						const timezone = this.getNodeParameter('timezone', i) as string;
						responseData = await manageLmApiRequest.call(this, 'GET', '/security/export', {}, { timezone });
					}
				}

				// ========== INVENTORY ==========
				else if (resource === 'inventory') {
					if (operation === 'get') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'GET', `/inventory/${agentId}`);
					} else if (operation === 'trigger') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'POST', `/inventory/${agentId}`);
					} else if (operation === 'exportPdf') {
						const timezone = this.getNodeParameter('timezone', i) as string;
						responseData = await manageLmApiRequest.call(this, 'GET', '/inventory/export', {}, { timezone });
					}
				}

				// ========== ACCOUNT ==========
				else if (resource === 'account') {
					if (operation === 'get') {
						responseData = await manageLmApiRequest.call(this, 'GET', '/account');
					} else if (operation === 'update') {
						const updateFields = this.getNodeParameter('updateFields', i, {}) as Record<string, any>;
						const body: Record<string, any> = {};
						if (updateFields.name) body.name = updateFields.name;
						// Convert empty string schedules to null
						for (const key of ['audit_report_schedule', 'inventory_report_schedule']) {
							if (updateFields[key] !== undefined) {
								body[key] = updateFields[key] || null;
							}
						}
						responseData = await manageLmApiRequest.call(this, 'PATCH', '/account', body);
					} else if (operation === 'invite') {
						const email = this.getNodeParameter('email', i) as string;
						const role = this.getNodeParameter('role', i) as string;
						const permissions = this.getNodeParameter('permissions', i, {}) as Record<string, boolean>;
						const body: Record<string, any> = { email, role, ...permissions };
						responseData = await manageLmApiRequest.call(this, 'POST', '/account/invite', body);
					}
				}

				// ========== AUDIT LOG ==========
				else if (resource === 'audit') {
					if (operation === 'getAll') {
						const filters = this.getNodeParameter('filters', i, {}) as Record<string, any>;
						const qs: Record<string, string | number> = {};
						if (filters.action) qs.action = filters.action;
						if (filters.limit) qs.limit = filters.limit;
						if (filters.offset) qs.offset = filters.offset;
						responseData = await manageLmApiRequest.call(this, 'GET', '/audit', {}, qs);
					}
				}

				// ========== NOTIFICATION ==========
				else if (resource === 'notification') {
					if (operation === 'getAll') {
						responseData = await manageLmApiRequest.call(this, 'GET', '/notifications');
					} else if (operation === 'markRead') {
						const idsStr = this.getNodeParameter('notificationIds', i) as string;
						const body: Record<string, any> = {};
						if (idsStr) {
							body.ids = idsStr.split(',').map((id) => id.trim()).filter(Boolean);
						}
						responseData = await manageLmApiRequest.call(this, 'POST', '/notifications/read', body);
					} else if (operation === 'clear') {
						responseData = await manageLmApiRequest.call(this, 'DELETE', '/notifications');
					}
				}

				// ========== REPORT ==========
				else if (resource === 'report') {
					if (operation === 'getAll') {
						const startDate = this.getNodeParameter('startDate', i) as string;
						const endDate = this.getNodeParameter('endDate', i) as string;
						const limit = this.getNodeParameter('limit', i, 50) as number;
						const filters = this.getNodeParameter('filters', i, {}) as Record<string, any>;
						const qs: Record<string, string | number | boolean> = {
							start_date: startDate,
							end_date: endDate,
							limit,
						};
						if (filters.agent_id) qs.agent_id = filters.agent_id;
						if (filters.mutating_only !== undefined) qs.mutating_only = filters.mutating_only;
						responseData = await manageLmApiRequest.call(this, 'GET', '/report', {}, qs);
					} else if (operation === 'exportPdf') {
						const startDate = this.getNodeParameter('startDate', i) as string;
						const endDate = this.getNodeParameter('endDate', i) as string;
						const filters = this.getNodeParameter('filters', i, {}) as Record<string, any>;
						const qs: Record<string, string | boolean> = {
							start_date: startDate,
							end_date: endDate,
						};
						if (filters.agent_id) qs.agent_id = filters.agent_id;
						if (filters.mutating_only !== undefined) qs.mutating_only = filters.mutating_only;
						responseData = await manageLmApiRequest.call(this, 'GET', '/report/export', {}, qs);
					}
				}

				// ========== API KEY ==========
				else if (resource === 'apiKey') {
					if (operation === 'getAll') {
						responseData = await manageLmApiRequest.call(this, 'GET', '/api-keys');
					} else if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const permissions = this.getNodeParameter('permissions', i, {}) as Record<string, boolean>;
						const expiresInDays = this.getNodeParameter('expiresInDays', i) as number;
						const body: Record<string, any> = { name };
						if (Object.keys(permissions).length > 0) body.permissions = permissions;
						if (expiresInDays > 0) body.expires_in_days = expiresInDays;
						responseData = await manageLmApiRequest.call(this, 'POST', '/api-keys', body);
					} else if (operation === 'delete') {
						const apiKeyId = this.getNodeParameter('apiKeyId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'DELETE', `/api-keys/${apiKeyId}`);
					}
				}

				// ========== SEARCH ==========
				else if (resource === 'search') {
					const query = this.getNodeParameter('query', i, '') as string;
					const group = this.getNodeParameter('group', i, '') as string;
					const qs: Record<string, string | number | boolean> = {};
					if (query) qs.query = query;
					if (group) qs.group = group;

					if (operation === 'agents') {
						const status = this.getNodeParameter('status', i, '') as string;
						const cpuAbove = this.getNodeParameter('cpuAbove', i, 0) as number;
						const memoryAbove = this.getNodeParameter('memoryAbove', i, 0) as number;
						const diskAbove = this.getNodeParameter('diskAbove', i, 0) as number;
						if (status) qs.status = status;
						if (cpuAbove > 0) qs.cpu_above = cpuAbove;
						if (memoryAbove > 0) qs.memory_above = memoryAbove;
						if (diskAbove > 0) qs.disk_above = diskAbove;
						responseData = await manageLmApiRequest.call(this, 'GET', '/search/agents', {}, qs);
					} else if (operation === 'inventory') {
						const category = this.getNodeParameter('category', i, '') as string;
						const itemStatus = this.getNodeParameter('itemStatus', i, '') as string;
						if (category) qs.category = category;
						if (itemStatus) qs.status = itemStatus;
						responseData = await manageLmApiRequest.call(this, 'GET', '/search/inventory', {}, qs);
					} else if (operation === 'security') {
						const severity = this.getNodeParameter('severity', i, '') as string;
						const findingCategory = this.getNodeParameter('findingCategory', i, '') as string;
						if (severity) qs.severity = severity;
						if (findingCategory) qs.category = findingCategory;
						responseData = await manageLmApiRequest.call(this, 'GET', '/search/security', {}, qs);
					} else if (operation === 'sshKeys') {
						const user = this.getNodeParameter('user', i, '') as string;
						const unknownOnly = this.getNodeParameter('unknownOnly', i, false) as boolean;
						if (user) qs.user = user;
						if (unknownOnly) qs.unknown_only = 'true';
						responseData = await manageLmApiRequest.call(this, 'GET', '/search/ssh-keys', {}, qs);
					} else if (operation === 'sudoRules') {
						const user = this.getNodeParameter('user', i, '') as string;
						const nopasswdOnly = this.getNodeParameter('nopasswdOnly', i, false) as boolean;
						if (user) qs.user = user;
						if (nopasswdOnly) qs.nopasswd_only = 'true';
						responseData = await manageLmApiRequest.call(this, 'GET', '/search/sudo-rules', {}, qs);
					}
				}

				// ========== EMAIL ==========
				else if (resource === 'email') {
					if (operation === 'send') {
						const subject = this.getNodeParameter('subject', i) as string;
						const body = this.getNodeParameter('body', i) as string;
						responseData = await manageLmApiRequest.call(this, 'POST', '/email', { subject, body });
					}
				}

				// ========== DEPENDENCY ==========
				else if (resource === 'dependency') {
					if (operation === 'scan') {
						responseData = await manageLmApiRequest.call(this, 'POST', '/dependency/scan');
					} else if (operation === 'getResults') {
						const scanId = this.getNodeParameter('scanId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'GET', `/dependency/scan/${scanId}`);
					}
				}

				// Normalize output: ensure we always return an array of objects
				const outputItems = Array.isArray(responseData) ? responseData : [responseData ?? {}];
				for (const item of outputItems) {
					returnData.push({ json: item });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
