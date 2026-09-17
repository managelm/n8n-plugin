## Git workflow

- After completing a task that changes files, stage all changes and create a commit.
- Use an imperative, descriptive message (max ~72 chars).
- Do not commit if tests fail; fix first.
- Commmit the change and git push.
- Do not ask for confirmations for git commits and push.

## Build & deploy

- `./package.sh` builds TypeScript, copies icons, and creates a `.tgz` npm package. Use `--publish` to publish to npm.
- `./deploy.sh` tags, pushes to origin + GitHub, and creates a GitHub release with the tgz attached.
- Version is read from `package.json`. Use `./package.sh --patch|--minor|--major` to bump before building.
- GitHub repo: https://github.com/managelm/n8n-plugin

## Coding practices

- Keep the code as clean as possible.
- Follow the n8n community node conventions (INodeType, INodeTypeDescription).
- API keys reach only the MCP-equivalent portal routes (portal auth/token-surface.ts): no settings, users, keys, webhooks or create/update/delete of agents, skills and groups. Only add operations the portal lists there.
- The trigger node does not manage webhooks (keys cannot): an admin creates the webhook in the portal with the node's URL and a secret, and the same secret goes into a ManageLM Webhook credential (`manageLmWebhookApi`), never a node parameter.
- All webhook deliveries are HMAC-verified over the raw body and refused when the signed `timestamp` is more than 5 minutes off. Refusals write their own 403 and return `noWebhookResponse` (a `webhookResponse` would go out as 200).
- Workflows saved with an older release must keep loading: do not rename a parameter or option value that kept its meaning (n8n allows one name under different displayOptions). A removed operation throws; list any unavoidable change in the README's "Upgrading" section.

## Versioning

- Version is in `package.json`. Use `./package.sh --patch|--minor|--major` to bump.
- No separate changelog file — release notes go in the GitHub release description.
