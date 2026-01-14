#!/usr/bin/env bash
set -euo pipefail
sha="8067faa0ae71e9cc7e4c74e75dd4b53700ec59eb"
owner="OlegAnt12"
repo="AnunciosLoc"
if [ -z "${GITHUB_TOKEN:-}" ]; then echo "GITHUB_TOKEN not set" >&2; exit 1; fi
while true; do
  state=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/$owner/$repo/commits/$sha/status" | jq -r '.state')
  echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') CI status: $state"
  if [ "$state" = "success" ]; then
    echo "CI PASSED"
    exit 0
  fi
  if [ "$state" = "failure" ] || [ "$state" = "error" ]; then
    echo "CI FAILED"
    exit 2
  fi
  sleep 20
done
