#!/usr/bin/env bash
# start-dev.sh — start Postgres (Docker) + backend (mvn spring-boot:run) + frontend (npm start).
# Companion teardown: scripts/stop-dev.sh
#
# On Ctrl+C: stops backend + frontend, leaves Postgres running for quick restarts.

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$REPO_ROOT"

LOG_DIR="$REPO_ROOT/.logs"
PID_DIR="$LOG_DIR/pids"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"
BACKEND_PID_FILE="$PID_DIR/backend.pid"
FRONTEND_PID_FILE="$PID_DIR/frontend.pid"
mkdir -p "$PID_DIR"

if [[ -t 1 ]]; then
  BOLD=$'\033[1m'; RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; BLUE=$'\033[34m'; RESET=$'\033[0m'
else
  BOLD=''; RED=''; GREEN=''; YELLOW=''; BLUE=''; RESET=''
fi
log()  { printf '%s[start-dev]%s %s\n' "$BLUE"   "$RESET" "$*"; }
warn() { printf '%s[start-dev]%s %s\n' "$YELLOW" "$RESET" "$*"; }
err()  { printf '%s[start-dev]%s %s\n' "$RED"    "$RESET" "$*" >&2; }
ok()   { printf '%s[start-dev]%s %s\n' "$GREEN"  "$RESET" "$*"; }

# ---- pick docker compose flavor ----
if docker compose version >/dev/null 2>&1; then
  DC=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  DC=(docker-compose)
else
  err "Neither 'docker compose' nor 'docker-compose' is available on PATH."
  exit 1
fi

# ---- preflight: required tools ----
missing=()
for tool in docker mvn npm node curl lsof; do
  command -v "$tool" >/dev/null 2>&1 || missing+=("$tool")
done
if (( ${#missing[@]} > 0 )); then
  err "Missing required tools: ${missing[*]}"
  err "Install them and re-run. See README.md → Prerequisites."
  exit 1
fi

# ---- preflight: .env must exist ----
if [[ ! -f "$REPO_ROOT/.env" ]]; then
  err ".env file not found at repo root: $REPO_ROOT/.env"
  err ""
  if [[ -f "$REPO_ROOT/.env.example" ]]; then
    err "Create one from the template:"
    err ""
    err "  cp .env.example .env"
    err "  # then replace JWT_SECRET with: \$(openssl rand -base64 32)"
  else
    err "Create one before running this script (see README.md § Environment Configuration)."
  fi
  exit 1
fi

# ---- preflight: no port collisions on 8080 / 4200 ----
port_in_use() { lsof -iTCP:"$1" -sTCP:LISTEN -n -P >/dev/null 2>&1; }
for port in 8080 4200; do
  if port_in_use "$port"; then
    err "Port $port is already in use. Free it (or run scripts/stop-dev.sh) and retry."
    exit 1
  fi
done

# ---- export .env into environment so mvn spring-boot:run sees ${DB_URL} etc. ----
set -a
# shellcheck disable=SC1091
source "$REPO_ROOT/.env"
set +a

# ---- teardown on Ctrl+C ----
BACKEND_PID=""
FRONTEND_PID=""
cleanup() {
  local ec=$?
  trap - INT TERM EXIT
  echo ""
  log "Shutting down… (Postgres stays running — use scripts/stop-dev.sh for full teardown)"
  if [[ -n "$FRONTEND_PID" ]]; then
    pkill -TERM -P "$FRONTEND_PID" 2>/dev/null || true
    kill  -TERM     "$FRONTEND_PID" 2>/dev/null || true
  fi
  if [[ -n "$BACKEND_PID" ]]; then
    pkill -TERM -P "$BACKEND_PID" 2>/dev/null || true
    kill  -TERM     "$BACKEND_PID" 2>/dev/null || true
  fi
  rm -f "$FRONTEND_PID_FILE" "$BACKEND_PID_FILE"
  exit "$ec"
}
trap cleanup INT TERM

# ---- 1. Postgres ----
log "Starting Postgres container…"
"${DC[@]}" up -d postgres >/dev/null

log "Waiting for Postgres to accept connections…"
for i in {1..30}; do
  if docker exec fittrack-db pg_isready -U fittrack_user -d fittrack >/dev/null 2>&1; then
    ok "Postgres ready on :5432 (container fittrack-db)"
    break
  fi
  if (( i == 30 )); then
    err "Postgres did not become ready within 30s. Check: docker logs fittrack-db"
    exit 1
  fi
  sleep 1
done

# ---- 2. Backend ----
log "Starting backend → $BACKEND_LOG"
: > "$BACKEND_LOG"
(
  cd "$REPO_ROOT/fittrack-backend"
  nohup mvn spring-boot:run >> "$BACKEND_LOG" 2>&1 &
  echo $! > "$BACKEND_PID_FILE"
)
BACKEND_PID=$(cat "$BACKEND_PID_FILE")
log "Backend PID: $BACKEND_PID"

log "Waiting for backend health at http://localhost:8080/actuator/health (up to 120s)…"
for i in {1..120}; do
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    err "Backend process exited before becoming healthy. Last lines of $BACKEND_LOG:"
    tail -n 40 "$BACKEND_LOG" >&2 || true
    exit 1
  fi
  status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/actuator/health" || echo "000")
  if [[ "$status" == "200" ]]; then
    ok "Backend ready on :8080"
    break
  fi
  if (( i == 120 )); then
    err "Backend did not become healthy within 120s. Last lines of $BACKEND_LOG:"
    tail -n 40 "$BACKEND_LOG" >&2 || true
    exit 1
  fi
  sleep 1
done

# ---- 3. Frontend ----
if [[ ! -d "$REPO_ROOT/fittrack-frontend/node_modules" ]]; then
  log "node_modules missing — running 'npm install' (one-time)…"
  ( cd "$REPO_ROOT/fittrack-frontend" && npm install )
fi

log "Starting frontend → $FRONTEND_LOG"
: > "$FRONTEND_LOG"
(
  cd "$REPO_ROOT/fittrack-frontend"
  nohup npm start >> "$FRONTEND_LOG" 2>&1 &
  echo $! > "$FRONTEND_PID_FILE"
)
FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
log "Frontend PID: $FRONTEND_PID"

log "Waiting for frontend at http://localhost:4200 (up to 180s)…"
for i in {1..180}; do
  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    err "Frontend process exited before becoming ready. Last lines of $FRONTEND_LOG:"
    tail -n 40 "$FRONTEND_LOG" >&2 || true
    exit 1
  fi
  if curl -s -o /dev/null "http://localhost:4200" 2>/dev/null; then
    ok "Frontend ready on :4200"
    break
  fi
  if (( i == 180 )); then
    err "Frontend did not become ready within 180s. Last lines of $FRONTEND_LOG:"
    tail -n 40 "$FRONTEND_LOG" >&2 || true
    exit 1
  fi
  sleep 1
done

# ---- summary ----
echo ""
printf '%s%s✓ All services up.%s\n' "$BOLD" "$GREEN" "$RESET"
printf '  %sBackend:%s  http://localhost:8080          (PID %s)\n' "$BOLD" "$RESET" "$BACKEND_PID"
printf '  %sFrontend:%s http://localhost:4200          (PID %s)\n' "$BOLD" "$RESET" "$FRONTEND_PID"
printf '  %sPostgres:%s localhost:5432                 (container fittrack-db)\n' "$BOLD" "$RESET"
echo ""
printf '  Logs:\n'
printf '    tail -f %s\n' "$BACKEND_LOG"
printf '    tail -f %s\n' "$FRONTEND_LOG"
echo ""
printf '  Press %sCtrl+C%s to stop backend + frontend (Postgres stays running).\n' "$BOLD" "$RESET"
printf '  For full teardown incl. Postgres: %sscripts/stop-dev.sh%s\n' "$BOLD" "$RESET"
echo ""

# Watch both processes; if either dies, warn and clean up the other.
while true; do
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    err "Backend exited unexpectedly (PID $BACKEND_PID). See $BACKEND_LOG"
    cleanup
  fi
  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    err "Frontend exited unexpectedly (PID $FRONTEND_PID). See $FRONTEND_LOG"
    cleanup
  fi
  sleep 2
done
