#!/usr/bin/env bash
# refresh.sh — full build + sync + start cycle for the standalone deployment.
# Run from the `app/` directory.
#
# Usage:
#   ./refresh.sh                # build, sync, start in foreground
#   ./refresh.sh --no-start     # build + sync only (e.g. for systemd-managed runs)
#
# Reads env from ../.env (or .env.local if present).

set -euo pipefail

cd "$(dirname "$0")"

NO_START=0
for arg in "$@"; do
  case "$arg" in
    --no-start) NO_START=1 ;;
    *) ;;
  esac
done

# locate env file
ENV_FILE=""
if [[ -f .env.local ]]; then
  ENV_FILE=".env.local"
elif [[ -f ../.env ]]; then
  ENV_FILE="../.env"
fi
if [[ -n "$ENV_FILE" ]]; then
  echo "→ loading env from $ENV_FILE"
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

echo "→ killing anything on port ${HOST_PORT:-3939}"
lsof -ti tcp:"${HOST_PORT:-3939}" | xargs -r kill 2>/dev/null || true

echo "→ bun install --frozen-lockfile"
bun install --frozen-lockfile

echo "→ bun run build"
bun run build

echo "→ syncing public/ and .next/static into standalone bundle"
cp -r public .next/standalone/ 2>/dev/null || true
cp -r .next/static .next/standalone/.next/

if [[ "$NO_START" -eq 1 ]]; then
  echo "✓ build + sync done (--no-start specified)"
  exit 0
fi

PORT="${HOST_PORT:-3939}"
HOST="${HOST_BIND:-127.0.0.1}"

echo "→ starting standalone server on ${HOST}:${PORT}"
PORT="$PORT" HOST="$HOST" HOSTNAME="$HOST" bun .next/standalone/server.js
