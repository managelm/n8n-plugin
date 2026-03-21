#!/usr/bin/env bash
# Build, package, and optionally publish n8n-nodes-managelm to npm
set -euo pipefail

cd "$(dirname "$0")"
git config --global --add safe.directory "$(pwd)" 2>/dev/null || true

PKG_NAME=$(node -p "require('./package.json').name")
PKG_VERSION=$(node -p "require('./package.json').version")
TARBALL="${PKG_NAME}-${PKG_VERSION}.tgz"

# ── Parse flags ──────────────────────────────────────────────────────
PUBLISH=false
BUMP=""
for arg in "$@"; do
  case "$arg" in
    --publish) PUBLISH=true ;;
    --patch)   BUMP="patch" ;;
    --minor)   BUMP="minor" ;;
    --major)   BUMP="major" ;;
    --help|-h)
      echo "Usage: ./package.sh [options]"
      echo ""
      echo "Options:"
      echo "  --publish   Build and publish to npm (prompts for access token)"
      echo "  --patch     Bump patch version before building (1.0.0 → 1.0.1)"
      echo "  --minor     Bump minor version before building (1.0.0 → 1.1.0)"
      echo "  --major     Bump major version before building (1.0.0 → 2.0.0)"
      echo "  --help      Show this help"
      echo ""
      echo "Without --publish, creates a local .tgz package only."
      exit 0
      ;;
  esac
done

# ── Version bump ─────────────────────────────────────────────────────
if [[ -n "$BUMP" ]]; then
  echo "==> Bumping ${BUMP} version..."
  npm version "$BUMP" --no-git-tag-version
  PKG_VERSION=$(node -p "require('./package.json').version")
  TARBALL="${PKG_NAME}-${PKG_VERSION}.tgz"
  echo "    New version: ${PKG_VERSION}"
fi

# ── Build ────────────────────────────────────────────────────────────
echo "==> Cleaning previous build..."
rm -rf dist/
rm -f *.tgz

echo "==> Installing dependencies..."
npm install --ignore-scripts

echo "==> Compiling TypeScript..."
npx tsc

echo "==> Copying assets (icons, codex JSON)..."
npx gulp build:icons

# ── Publish or pack ──────────────────────────────────────────────────
if [[ "$PUBLISH" == "true" ]]; then
  # Check for existing token
  EXISTING_TOKEN=$(npm config get //registry.npmjs.org/:_authToken 2>/dev/null || true)

  if [[ -z "$EXISTING_TOKEN" || "$EXISTING_TOKEN" == "undefined" ]]; then
    echo ""
    echo "An npm access token is required to publish."
    echo "Create one at: https://www.npmjs.com → Account → Access Tokens → Granular Access Token"
    echo ""
    read -rsp "Paste your npm access token: " NPM_TOKEN
    echo ""

    if [[ -z "$NPM_TOKEN" ]]; then
      echo "Error: No token provided. Aborting."
      exit 1
    fi

    npm config set "//registry.npmjs.org/:_authToken=${NPM_TOKEN}"
    echo "    Token saved to npm config."
  else
    echo "==> Using existing npm access token."
  fi

  echo "==> Publishing ${PKG_NAME}@${PKG_VERSION} to npm..."
  npm publish --access public

  echo ""
  echo "Published ${PKG_NAME}@${PKG_VERSION} to npm."
  echo "Install in n8n: Settings → Community Nodes → Install → ${PKG_NAME}"
else
  echo "==> Creating npm package..."
  npm pack

  echo ""
  echo "Package created: ${TARBALL}"
  echo ""
  echo "Install into n8n:"
  echo "  cd ~/.n8n && npm install /path/to/${TARBALL}"
  echo ""
  echo "To publish to npm instead, run:"
  echo "  ./package.sh --publish"
fi

# Restore ownership (scripts may run as root)
[[ "$(pwd)" == "/" ]] && { echo "FATAL: pwd is /"; exit 1; }
chown -R claude:claude "$(pwd)"
