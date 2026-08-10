#!/usr/bin/env bash
# stop-dev.sh — stop backend + frontend started by start-dev.sh, then bring Postgres down.

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$REPO_ROOT"

PID_DIR="$REPO_ROOT/.logs/pids"
BACKEND_PID_FILE="$PID_DIR/backend.pid"
FRONTEND_PID_FILE="$PID_DIR/frontend.pid"

if [[ -t 1 ]]; then
  RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; BLUE=$'\033[34m'; RESET=$'\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; BLUE=''; RESET=''
fi
log()  { printf '%s[stop-dev]%s %s\n' "$BLUE"   "$RESET" "$*"; }
warn() { printf '%s[stop-dev]%s %s\n' "$YELLOW" "$RESET" "$*"; }
ok()   { printf '%s[stop-dev]%s %s\n' "$GREEN"  "$RESET" "$*"; }
err()  { printf '%s[stop-dev]%s %s\n' "$RED"    "$RESET" "$*" >&2; }

stop_pid_file() {
  local label="$1" file="$2"
  if [[ ! -f "$file" ]]; then
    warn "$label: no PID file at $file — skipping"
    return
  fi
  local pid
  pid=$(cat "$file" 2>/dev/null || echo "")
  if [[ -z "$pid" ]]; then
    warn "$label: empty PID file — removing"
    rm -f "$file"
    return
  fi
  if kill -0 "$pid" 2>/dev/null; then
    log "$label: stopping PID $pid (and children)"
    pkill -TERM -P "$pid" 2>/dev/null || true
    kill  -TERM     "$pid" 2>/dev/null || true
    for _ in {1..10}; do
      if ! kill -0 "$pid" 2>/dev/null; then
        ok "$label: stopped"
        rm -f "$file"
        return
      fi
      sleep 1
    done
    warn "$label: still running after 10s — sending SIGKILL"
    pkill -KILL -P "$pid" 2>/dev/null || true
    kill  -KILL     "$pid" 2>/dev/null || true
  else
    warn "$label: PID $pid not running — cleaning up stale PID file"
  fi
  rm -f "$file"
}

stop_pid_file "Frontend" "$FRONTEND_PID_FILE"
stop_pid_file "Backend"  "$BACKEND_PID_FILE"

# ---- pick docker compose flavor ----
if docker compose version >/dev/null 2>&1; then
  DC=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  DC=(docker-compose)
else
  warn "Neither 'docker compose' nor 'docker-compose' available — skipping Postgres teardown."
  ok "Backend/frontend stopped."
  exit 0
fi

log "Bringing down Postgres container…"
"${DC[@]}" down
ok "All services stopped."
