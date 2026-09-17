import type { INodeProperties } from 'n8n-workflow';

/**
 * Search operations — one per GET /api/search/<path> route, the REST twins of
 * the ManageLM MCP search tools. The operation value is the route segment,
 * except sshKeys and sudoRules, which keep their 1.0 values so saved workflows
 * still run (SEARCH_PATHS in ManageLm.node.ts maps them).
 *
 * Parameter names from 1.0 (status, category, itemStatus, findingCategory,
 * user, severity, unknownOnly, nopasswdOnly) are kept for the same reason. n8n
 * allows one name under different displayOptions, as long as only one is shown.
 */
export const searchOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['search'] } },
		options: [
			{ name: 'Activity', value: 'activity', description: 'Search logins, failed logins, sudo commands and file changes', action: 'Search activity' },
			{ name: 'Agents', value: 'agents', description: 'Search agents by health, OS, status, group, site, or text', action: 'Search agents' },
			{ name: 'Backups', value: 'backups', description: 'Search backups and their last run', action: 'Search backups' },
			{ name: 'Certificates (Discovered)', value: 'certs', description: 'Search certificates found on your servers by certificate scans', action: 'Search discovered certificates' },
			{ name: 'Certificates (Managed)', value: 'pki', description: 'Search the certificates ManageLM issues and renews', action: 'Search managed certificates' },
			{ name: 'Cloud Resources', value: 'cloud', description: 'Search VMs, volumes, networks and security groups from hosting connectors', action: 'Search cloud resources' },
			{ name: 'Credentials', value: 'credentials', description: 'Search rotating credentials (metadata only, requires the Credentials permission)', action: 'Search credentials' },
			{ name: 'Hosting Connectors', value: 'connectors', description: 'List hosting connectors', action: 'List hosting connectors' },
			{ name: 'Inventory', value: 'inventory', description: 'Search installed packages, services, containers across agents', action: 'Search inventory' },
			{ name: 'Keystore', value: 'keystore', description: 'Search keystore keys, applications, usage and refusals (requires the Keystore permission)', action: 'Search keystore' },
			{ name: 'Monitors', value: 'monitors', description: 'Search monitors and their current status', action: 'Search monitors' },
			{ name: 'Security', value: 'security', description: 'Search audit findings, pentest findings and threat alerts', action: 'Search security issues' },
			{ name: 'SSH Keys', value: 'sshKeys', description: 'Search SSH keys across infrastructure', action: 'Search SSH keys' },
			{ name: 'Sudo Rules', value: 'sudoRules', description: 'Search sudo privileges across infrastructure', action: 'Search sudo rules' },
		],
		default: 'agents',
	},
];

/**
 * Operations that accept each common filter. SSH Keys and Sudo Rules take a
 * query too, with its own definition below (it is not free text there).
 */
const WITH_QUERY = ['activity', 'agents', 'backups', 'certs', 'pki', 'cloud', 'credentials', 'inventory', 'keystore', 'monitors', 'security'];
const WITH_GROUP = ['activity', 'agents', 'certs', 'inventory', 'security', 'sshKeys', 'sudoRules'];
const WITH_SITE = ['activity', 'agents', 'backups', 'certs', 'pki', 'credentials', 'inventory', 'monitors', 'security', 'sshKeys', 'sudoRules'];
const WITH_AGENT = ['backups', 'pki', 'credentials', 'keystore', 'monitors'];
const WITH_TIME = ['activity', 'security'];

const show = (operation: string[]) => ({ show: { resource: ['search'], operation } });

export const searchFields: INodeProperties[] = [
	// ------ Common filters ------
	// Query and User mean different things per operation, so they are defined
	// once per meaning under the same name: a saved workflow keeps its value, and
	// the operation lists never overlap, so only one of each is shown.
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		default: '',
		description: 'Free-text search',
		displayOptions: show(WITH_QUERY),
	},
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		default: '',
		description: 'Key fingerprint or system username. To find the keys of a ManageLM user, use User.',
		displayOptions: show(['sshKeys']),
	},
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		default: '',
		description: 'System username. To find the sudo rules of a ManageLM user, use User.',
		displayOptions: show(['sudoRules']),
	},
	{
		displayName: 'Group',
		name: 'group',
		type: 'string',
		default: '',
		description: 'Filter by server group name',
		displayOptions: show(WITH_GROUP),
	},
	{
		displayName: 'Site',
		name: 'site',
		type: 'string',
		default: '',
		description: 'Filter by site name',
		displayOptions: show(WITH_SITE),
	},
	{
		displayName: 'Agent',
		name: 'agent',
		type: 'string',
		default: '',
		description: 'Filter by agent hostname or display name',
		displayOptions: show(WITH_AGENT),
	},
	{
		displayName: 'User',
		name: 'user',
		type: 'string',
		default: '',
		description: 'Filter by system username or ManageLM user name or email (partial match)',
		displayOptions: show(['activity']),
	},
	// The portal resolves "me" on these two routes only; on Activity it would be
	// matched as text inside usernames.
	{
		displayName: 'User',
		name: 'user',
		type: 'string',
		default: '',
		description: 'Filter by ManageLM user name or email, matched through the SSH keys on their profile ("me" for yourself)',
		displayOptions: show(['sshKeys', 'sudoRules']),
	},
	{
		displayName: 'Since',
		name: 'since',
		type: 'dateTime',
		default: '',
		description: 'Only entries at or after this time',
		displayOptions: show(WITH_TIME),
	},
	{
		displayName: 'Until',
		name: 'until',
		type: 'dateTime',
		default: '',
		description: 'Only entries before this time',
		displayOptions: show(WITH_TIME),
	},

	// ------ Agents ------
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Approved (Never Connected)', value: 'approved' },
			{ name: 'Offline', value: 'offline' },
			{ name: 'Online', value: 'online' },
			{ name: 'Pending Approval', value: 'pending_approval' },
		],
		default: '',
		description: 'Filter by agent status',
		displayOptions: show(['agents']),
	},
	{
		displayName: 'CPU Above %',
		name: 'cpuAbove',
		type: 'number',
		default: 0,
		description: 'Only agents with CPU usage above this percentage (0 = no filter)',
		displayOptions: show(['agents']),
	},
	{
		displayName: 'Memory Above %',
		name: 'memoryAbove',
		type: 'number',
		default: 0,
		description: 'Only agents with memory usage above this percentage (0 = no filter)',
		displayOptions: show(['agents']),
	},
	{
		displayName: 'Disk Above %',
		name: 'diskAbove',
		type: 'number',
		default: 0,
		description: 'Only agents with disk usage above this percentage (0 = no filter)',
		displayOptions: show(['agents']),
	},

	// ------ Inventory ------
	{
		displayName: 'Category',
		name: 'category',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Container', value: 'container' },
			{ name: 'Database', value: 'database' },
			{ name: 'Log', value: 'log' },
			{ name: 'Mail', value: 'mail' },
			{ name: 'Monitoring', value: 'monitoring' },
			{ name: 'Network', value: 'network' },
			{ name: 'Other', value: 'other' },
			{ name: 'Scheduler', value: 'scheduler' },
			{ name: 'Security', value: 'security' },
			{ name: 'Software', value: 'software' },
			{ name: 'Storage', value: 'storage' },
			{ name: 'System', value: 'system' },
			{ name: 'User', value: 'user' },
			{ name: 'Web', value: 'web' },
		],
		default: '',
		displayOptions: show(['inventory']),
	},
	{
		displayName: 'Item Status',
		name: 'itemStatus',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Info', value: 'info' },
			{ name: 'Installed', value: 'installed' },
			{ name: 'Running', value: 'running' },
			{ name: 'Stopped', value: 'stopped' },
		],
		default: '',
		displayOptions: show(['inventory']),
	},

	// ------ Security ------
	{
		displayName: 'Source',
		name: 'securitySource',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Security Audits', value: 'audit' },
			{ name: 'Pentests', value: 'pentest' },
			{ name: 'Threat Alerts', value: 'threat' },
		],
		default: '',
		displayOptions: show(['security']),
	},
	{
		displayName: 'Minimum Severity',
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
		description: 'Return this level and above',
		displayOptions: show(['security']),
	},
	{
		displayName: 'Category',
		name: 'findingCategory',
		type: 'string',
		default: '',
		placeholder: 'e.g. ssh, firewall, users, tls, updates',
		description: 'Finding category (exact, case-insensitive). Threat alerts use "Threat Detection".',
		displayOptions: show(['security']),
	},
	{
		displayName: 'Unresolved Only',
		name: 'unresolved',
		type: 'boolean',
		default: true,
		description: 'Whether to hide resolved audit findings and acknowledged or ignored threats',
		displayOptions: show(['security']),
	},

	// ------ Activity ------
	{
		displayName: 'Category',
		name: 'activityCategory',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Failed Logins', value: 'failed_auth' },
			{ name: 'File Changes', value: 'file_changes' },
			{ name: 'Logins', value: 'sessions' },
			{ name: 'Sudo / Elevated Commands', value: 'root_commands' },
		],
		default: '',
		displayOptions: show(['activity']),
	},

	// ------ SSH keys / sudo ------
	{
		displayName: 'Unknown Keys Only',
		name: 'unknownOnly',
		type: 'boolean',
		default: false,
		description: 'Whether to return only keys not matched to a ManageLM user',
		displayOptions: show(['sshKeys']),
	},
	{
		displayName: 'NOPASSWD Only',
		name: 'nopasswdOnly',
		type: 'boolean',
		default: false,
		description: 'Whether to return only NOPASSWD sudo rules',
		displayOptions: show(['sudoRules']),
	},

	// ------ Discovered certificates ------
	{
		displayName: 'State',
		name: 'certState',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Expired', value: 'expired' },
			{ name: 'Expiring', value: 'expiring' },
			{ name: 'Managed', value: 'managed' },
			{ name: 'Self-Signed', value: 'self_signed' },
			{ name: 'Unmanaged', value: 'unmanaged' },
			{ name: 'Weak', value: 'weak' },
		],
		default: '',
		displayOptions: show(['certs']),
	},
	{
		displayName: 'Path',
		name: 'path',
		type: 'string',
		default: '',
		placeholder: 'e.g. /etc/ssl, letsencrypt',
		description: 'Filter by filesystem path (partial match)',
		displayOptions: show(['certs']),
	},

	// ------ Managed certificates ------
	{
		displayName: 'Status',
		name: 'pkiStatus',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Active', value: 'active' },
			{ name: 'Expired', value: 'expired' },
			{ name: 'Failed', value: 'failed' },
			{ name: 'Pending', value: 'pending' },
			{ name: 'Revoked', value: 'revoked' },
		],
		default: '',
		displayOptions: show(['pki']),
	},
	{
		displayName: 'Source',
		name: 'pkiSource',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Internal CA', value: 'local_ca' },
			{ name: "Let's Encrypt", value: 'letsencrypt' },
		],
		default: '',
		displayOptions: show(['pki']),
	},

	// ------ Monitors ------
	{
		displayName: 'Status',
		name: 'monitorStatus',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Degraded (Warning)', value: 'degraded' },
			{ name: 'Down (Critical)', value: 'down' },
			{ name: 'Pending', value: 'pending' },
			{ name: 'Stalled (Agent Offline)', value: 'stalled' },
			{ name: 'Up (OK)', value: 'up' },
		],
		default: '',
		displayOptions: show(['monitors']),
	},
	{
		displayName: 'Type',
		name: 'slug',
		type: 'string',
		default: '',
		placeholder: 'e.g. website, mysql, smtp, cpu, filesystem',
		description: 'Monitor type slug',
		displayOptions: show(['monitors']),
	},

	// ------ Backups ------
	{
		displayName: 'Status',
		name: 'backupStatus',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Failed', value: 'failed' },
			{ name: 'OK', value: 'ok' },
			{ name: 'Pending', value: 'pending' },
			{ name: 'Running', value: 'running' },
		],
		default: '',
		displayOptions: show(['backups']),
	},

	// ------ Credentials ------
	{
		displayName: 'State',
		name: 'credentialState',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Active', value: 'active' },
			{ name: 'Failed', value: 'failed' },
			{ name: 'Pending', value: 'pending' },
			{ name: 'Rotating', value: 'rotating' },
		],
		default: '',
		displayOptions: show(['credentials']),
	},
	{
		displayName: 'Type',
		name: 'credentialType',
		type: 'string',
		default: '',
		placeholder: 'e.g. password, ssh_key, ldap, entra',
		description: 'Kind or backend (substring match)',
		displayOptions: show(['credentials']),
	},

	// ------ Keystore ------
	{
		displayName: 'View',
		name: 'view',
		type: 'options',
		options: [
			{ name: 'Keys', value: 'keys' },
			{ name: 'Applications', value: 'clients' },
			{ name: 'Refusals per Day', value: 'denied' },
			{ name: 'Usage per Day', value: 'activity' },
		],
		default: 'keys',
		displayOptions: show(['keystore']),
	},

	// ------ Cloud resources ------
	{
		displayName: 'Resource Type',
		name: 'resourceType',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Network', value: 'network' },
			{ name: 'Security Group', value: 'security_group' },
			{ name: 'VM', value: 'vm' },
			{ name: 'Volume', value: 'volume' },
		],
		default: '',
		displayOptions: show(['cloud']),
	},
	{
		displayName: 'Provider',
		name: 'provider',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'AWS', value: 'aws' },
			{ name: 'Azure', value: 'azure' },
			{ name: 'GCP', value: 'gcp' },
			{ name: 'OpenStack', value: 'openstack' },
			{ name: 'Proxmox', value: 'proxmox' },
			{ name: 'VMware', value: 'vmware' },
		],
		default: '',
		displayOptions: show(['cloud']),
	},
	{
		displayName: 'Cloud Status',
		name: 'cloudStatus',
		type: 'string',
		default: '',
		placeholder: 'e.g. running, stopped',
		description: 'Provider-side status',
		displayOptions: show(['cloud']),
	},
	{
		displayName: 'Connector Name',
		name: 'connector',
		type: 'string',
		default: '',
		displayOptions: show(['cloud']),
	},
	{
		displayName: 'Unmatched VMs Only',
		name: 'unmatched',
		type: 'boolean',
		default: false,
		description: 'Whether to return only VMs with no ManageLM agent',
		displayOptions: show(['cloud']),
	},
];
