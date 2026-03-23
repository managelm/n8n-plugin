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
- The trigger node auto-manages webhooks (create on activate, delete on deactivate).
- All webhook deliveries are HMAC-verified.

## Versioning

- Version is in `package.json`. Use `./package.sh --patch|--minor|--major` to bump.
- No separate changelog file — release notes go in the GitHub release description.
