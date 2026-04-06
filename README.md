# n8n-nodes-managelm

n8n community node for [ManageLM](https://www.managelm.com) — manage Linux servers, run tasks, and monitor infrastructure from n8n workflows.

## Installation

### Community Nodes (recommended)

1. Open **Settings > Community Nodes** in your n8n instance.
2. Search for `n8n-nodes-managelm`.
3. Click **Install**.

### Manual

```bash
cd ~/.n8n
npm install n8n-nodes-managelm
```

Restart n8n after installing.

## Authentication

This node uses **ManageLM API Keys** for authentication.

1. Log into your ManageLM portal.
2. Go to **Settings > API Keys**.
3. Click **Create API Key** and select the permissions you need.
4. Copy the key (starts with `mlm_ak_`).
5. In n8n, create a new **ManageLM API** credential with your portal URL and API key.

## Nodes

### ManageLM

Perform actions on your ManageLM infrastructure.

| Resource | Operations |
|----------|------------|
| **Agent** | List All, Get, Get Metrics, Get Stats, Get Skills, Assign Skill, Remove Skill, Update, Approve, Delete |
| **Task** | Submit, Get Status, Get Changes, Revert, List |
| **Search** | Agents, Inventory, Security, SSH Keys, Sudo Rules |
| **Skill** | List All, Get, List Catalog, Import from Catalog, Create, Update, Delete |
| **Group** | List All, Create, Update, Delete, Get Agents, Set Agents, Add Agents, Get Members, Set Members, Set Skills |
| **Security** | Get Audit, Trigger Audit, Remediate Findings, Export PDF |
| **Inventory** | Get Report, Trigger Scan, Export PDF |
| **Email** | Send |
| **Account** | Get Info, Update Settings, Invite User |
| **Audit Log** | List Entries |
| **Notification** | List, Mark as Read, Clear |
| **Report** | List Operations, Export PDF |
| **API Key** | List, Create, Delete |
| **Dependency** | Trigger Scan, Get Results |

#### Submitting a Task

The **Task > Submit** operation is the primary way to interact with your servers. It runs a ManageLM skill on a target agent:

- **Agent ID** — the server to run the task on
- **Skill** — the skill slug (e.g. `base`, `packages`, `services`, `security`)
- **Instruction** — free-text description of what to do
- **Wait for Completion** — block until the task finishes (recommended for workflows)

### ManageLM Trigger

Start a workflow when a ManageLM event occurs. The trigger automatically creates and manages a webhook in your ManageLM portal.

| Event | Description |
|-------|-------------|
| `agent.enrolled` | A new agent requests to join |
| `agent.approved` | An agent was approved |
| `agent.online` | An agent came online |
| `agent.offline` | An agent went offline |
| `task.completed` | A task finished successfully |
| `task.failed` | A task failed |
| `task.needs_input` | A task needs user input to continue |

Webhook payloads are verified using HMAC-SHA256 signatures.

## Example Workflows

**Auto-approve new agents and run a security audit:**
1. ManageLM Trigger (event: `agent.enrolled`)
2. ManageLM (Agent > Approve)
3. ManageLM (Security > Trigger Audit)

**Alert on server going offline:**
1. ManageLM Trigger (event: `agent.offline`)
2. Slack / Email / PagerDuty node

**Scheduled package updates:**
1. Schedule Trigger (weekly)
2. ManageLM (Task > Submit: skill `packages`, instruction "Update all packages")

**Inventory report to Google Sheets:**
1. Schedule Trigger (daily)
2. ManageLM (Agent > List All)
3. ManageLM (Inventory > Get Report) for each agent
4. Google Sheets (append rows)

**Auto-remediate security findings:**
1. ManageLM (Security > Get Audit)
2. IF node (check for critical findings)
3. ManageLM (Security > Remediate)

**Weekly operations report by email:**
1. Schedule Trigger (weekly)
2. ManageLM (Report > Export PDF)
3. Email node (send PDF as attachment)

**Search for servers with high disk usage:**
1. ManageLM (Search > Agents, disk_above=80)
2. IF node (check results)
3. Slack / Email notification

**Find which servers run nginx:**
1. ManageLM (Search > Inventory, query="nginx")

**Revert a failed change:**
1. ManageLM (Task > Get Changes, taskId)
2. ManageLM (Task > Revert, taskId)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Link into a local n8n instance
npm link
cd ~/.n8n && npm link n8n-nodes-managelm

# Watch mode
npm run dev
```

## Requirements

- **n8n** v1.0+
- A [ManageLM](https://www.managelm.com) account with API key access (admin role required)

## Links

- [ManageLM Website](https://www.managelm.com)
- [Documentation](https://www.managelm.com/doc/)
- [GitHub](https://github.com/managelm/n8n-plugin)

## License

[MIT](LICENSE)
