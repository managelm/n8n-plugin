import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { manageLmApiRequest } from './GenericFunctions';

import { agentOperations, agentFields } from './descriptions/AgentDescription';
import { taskOperations, taskFields } from './descriptions/TaskDescription';
import { scanOperations, scanFields } from './descriptions/ScanDescription';
import { searchOperations, searchFields } from './descriptions/SearchDescription';
import { hostingOperations, hostingFields } from './descriptions/HostingDescription';
import { skillOperations, skillFields } from './descriptions/SkillDescription';
import { accountOperations, accountFields } from './descriptions/AccountDescription';
import { emailOperations, emailFields } from './descriptions/EmailDescription';

/**
 * Node parameter → query-string key, per search operation. Common filters
 * (query, group, site, agent, user, since, until) are read for every operation
 * and simply absent where the operation does not show them.
 *
 * `bool` parameters are sent only when they differ from the portal default:
 * `unresolved` defaults to true there, the `*_only` flags to false.
 */
const SEARCH_PARAMS: Record<string, Array<[param: string, key: string, kind?: 'bool' | 'boolFalse' | 'positive']>> = {
	agents: [['status', 'status'], ['cpuAbove', 'cpu_above', 'positive'], ['memoryAbove', 'memory_above', 'positive'], ['diskAbove', 'disk_above', 'positive']],
	inventory: [['category', 'category'], ['itemStatus', 'status']],
	security: [['securitySource', 'source'], ['severity', 'severity'], ['findingCategory', 'category'], ['unresolved', 'unresolved', 'boolFalse']],
	activity: [['activityCategory', 'category']],
	sshKeys: [['unknownOnly', 'unknown_only', 'bool']],
	sudoRules: [['nopasswdOnly', 'nopasswd_only', 'bool']],
	certs: [['certState', 'status'], ['path', 'path']],
	pki: [['pkiStatus', 'status'], ['pkiSource', 'source']],
	monitors: [['monitorStatus', 'status'], ['slug', 'slug']],
	backups: [['backupStatus', 'status']],
	credentials: [['credentialState', 'state'], ['credentialType', 'type']],
	keystore: [['view', 'view']],
	cloud: [['resourceType', 'type'], ['provider', 'provider'], ['cloudStatus', 'status'], ['connector', 'connector'], ['unmatched', 'unmatched', 'bool']],
	connectors: [],
};

/** Operations whose value is not their /api/search route segment (kept from 1.0). */
const SEARCH_PATHS: Record<string, string> = { sshKeys: 'ssh-keys', sudoRules: 'sudo-rules' };

const COMMON_SEARCH_PARAMS = ['query', 'group', 'site', 'agent', 'user', 'since', 'until'];

/**
 * resource → the operation values the node runs, read from the operation
 * selectors so it cannot drift from the UI. A workflow saved with 1.0 can still
 * hold a resource or operation that was removed (API keys cannot reach it); it
 * must fail loudly rather than output an empty item.
 */
const OPERATIONS: Record<string, string[]> = Object.fromEntries(
	[agentOperations, taskOperations, scanOperations, searchOperations, hostingOperations, skillOperations, accountOperations, emailOperations]
		.map(([selector]: INodeProperties[]) => [
			(selector.displayOptions?.show?.resource as string[])[0],
			(selector.options as INodePropertyOptions[]).map((option) => option.value as string),
		]),
);

export class ManageLm implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ManageLM',
		name: 'manageLm',
		icon: 'file:managelm.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Run tasks, scans and searches across your Linux and Windows servers with ManageLM',
		defaults: { name: 'ManageLM' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'manageLmApi',
				required: true,
			},
		],
		// The portal API covers the same features as the ManageLM MCP server:
		// reading the fleet, running tasks and scans, searches, hosting actions.
		// Portal settings and management (users, keys, webhooks, create/update/
		// delete of agents, skills, groups) are not available to API keys.
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
					{ name: 'Email', value: 'email' },
					{ name: 'Hosting', value: 'hosting' },
					{ name: 'Scan', value: 'scan' },
					{ name: 'Search', value: 'search' },
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
			...scanOperations,
			...scanFields,
			...searchOperations,
			...searchFields,
			...hostingOperations,
			...hostingFields,
			...skillOperations,
			...skillFields,
			...accountOperations,
			...accountFields,
			...emailOperations,
			...emailFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		// Fallback '': a removed resource has no operation selector left to read.
		const operation = this.getNodeParameter('operation', 0, '') as string;
		if (!OPERATIONS[resource]?.includes(operation)) {
			const name = operation ? `${resource} > ${operation}` : resource;
			throw new NodeOperationError(
				this.getNode(),
				`The operation "${name}" no longer exists in this version of the ManageLM node`,
				{ description: 'Open the node and pick one of the current operations. See "Upgrading from 1.0.x" in the node README.' },
			);
		}

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: any;

				// Tasks that dispatch to an agent can wait for the outcome. The portal
				// waits at most wait_seconds and then answers 202 with the task ID
				// (still_running: true) instead of holding the request open.
				const waitQs = (): Record<string, number> => {
					const wait = this.getNodeParameter('wait', i, true) as boolean;
					return wait ? { wait_seconds: this.getNodeParameter('waitSeconds', i, 120) as number } : {};
				};

				// ========== AGENT ==========
				if (resource === 'agent') {
					if (operation === 'getAll') {
						responseData = await manageLmApiRequest.call(this, 'GET', '/agents');
					} else if (operation === 'get') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'GET', `/agents/${agentId}`);
					} else if (operation === 'getSkills') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'GET', `/agents/${agentId}/skills`);
					}
				}

				// ========== TASK ==========
				else if (resource === 'task') {
					if (operation === 'submit') {
						const agentId = this.getNodeParameter('agentId', i) as string;
						const skillSlug = this.getNodeParameter('skillSlug', i) as string;
						const instruction = this.getNodeParameter('instruction', i) as string;
						responseData = await manageLmApiRequest.call(
							this, 'POST', '/tasks', { agent_id: agentId, skill_slug: skillSlug, instruction }, waitQs(),
						);
					} else if (operation === 'answer') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const answer = this.getNodeParameter('answer', i) as string;
						responseData = await manageLmApiRequest.call(this, 'POST', `/tasks/${taskId}/answer`, { answer }, waitQs());
					} else if (operation === 'followUp') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const instruction = this.getNodeParameter('instruction', i) as string;
						responseData = await manageLmApiRequest.call(this, 'POST', `/tasks/${taskId}/follow-up`, { instruction }, waitQs());
					} else if (operation === 'get') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'GET', `/tasks/${taskId}`);
					} else if (operation === 'getAll') {
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const qs: Record<string, string | number> = {};
						for (const key of ['agent_id', 'status', 'since', 'until', 'limit']) {
							if (filters[key] !== undefined && filters[key] !== '') qs[key] = filters[key] as string | number;
						}
						responseData = await manageLmApiRequest.call(this, 'GET', '/tasks', {}, qs);
					} else if (operation === 'getChanges') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const fullDiff = this.getNodeParameter('fullDiff', i, false) as boolean;
						responseData = await manageLmApiRequest.call(
							this, 'GET', `/tasks/${taskId}/changes`, {}, fullDiff ? { full_diff: 'true' } : {},
						);
					} else if (operation === 'revert') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						responseData = await manageLmApiRequest.call(this, 'POST', `/tasks/${taskId}/revert`);
					}
				}

				// ========== SCAN ==========
				// scanType is the portal route segment: security, inventory, sshkeys, certscan, activity.
				else if (resource === 'scan') {
					const scanType = this.getNodeParameter('scanType', i) as string;
					const agentId = this.getNodeParameter('agentId', i) as string;
					if (operation === 'get') {
						responseData = await manageLmApiRequest.call(this, 'GET', `/${scanType}/${agentId}`);
					} else if (operation === 'trigger') {
						responseData = await manageLmApiRequest.call(this, 'POST', `/${scanType}/${agentId}`);
					}
				}

				// ========== SEARCH ==========
				// The operation value is the /api/search route segment, except the
				// 1.0 values mapped in SEARCH_PATHS.
				else if (resource === 'search') {
					// Every search operation needs an entry, even an empty one.
					const mapping = SEARCH_PARAMS[operation];
					if (!mapping) {
						throw new NodeOperationError(this.getNode(), `No parameter mapping for search "${operation}"`, { itemIndex: i });
					}
					const qs: Record<string, string | number> = {};
					for (const param of COMMON_SEARCH_PARAMS) {
						const value = this.getNodeParameter(param, i, '') as string;
						if (value) qs[param] = value;
					}
					for (const [param, key, kind] of mapping) {
						const value = this.getNodeParameter(param, i, '') as string | number | boolean;
						if (kind === 'bool') { if (value === true) qs[key] = 'true'; }
						else if (kind === 'boolFalse') { if (value === false) qs[key] = 'false'; }
						else if (kind === 'positive') { if (typeof value === 'number' && value > 0) qs[key] = value; }
						else if (value !== '' && value !== undefined) qs[key] = value as string;
					}
					responseData = await manageLmApiRequest.call(this, 'GET', `/search/${SEARCH_PATHS[operation] ?? operation}`, {}, qs);
				}

				// ========== HOSTING ==========
				else if (resource === 'hosting') {
					const connectorId = this.getNodeParameter('connectorId', i) as string;
					if (operation === 'getActions') {
						responseData = await manageLmApiRequest.call(this, 'GET', `/connectors/${connectorId}/actions`);
					} else if (operation === 'runAction') {
						const resourceId = this.getNodeParameter('resourceId', i) as string;
						const action = this.getNodeParameter('action', i) as string;
						const rawParams = this.getNodeParameter('params', i, '{}') as string | IDataObject;
						let params: IDataObject;
						try {
							params = typeof rawParams === 'string' ? JSON.parse(rawParams || '{}') : rawParams;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Parameters must be valid JSON', { itemIndex: i });
						}
						responseData = await manageLmApiRequest.call(
							this, 'POST', `/connectors/${connectorId}/actions`, { resource_id: resourceId, action, params },
						);
					}
				}

				// ========== SKILL ==========
				else if (resource === 'skill') {
					if (operation === 'getAll') {
						responseData = await manageLmApiRequest.call(this, 'GET', '/skills');
					} else if (operation === 'catalog') {
						responseData = await manageLmApiRequest.call(this, 'GET', '/skills/catalog');
					}
				}

				// ========== ACCOUNT ==========
				else if (resource === 'account') {
					if (operation === 'get') {
						responseData = await manageLmApiRequest.call(this, 'GET', '/account');
					} else if (operation === 'getGroups') {
						responseData = await manageLmApiRequest.call(this, 'GET', '/groups');
					} else if (operation === 'getSites') {
						responseData = await manageLmApiRequest.call(this, 'GET', '/sites');
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
