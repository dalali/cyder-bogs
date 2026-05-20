#!/usr/bin/env bash
set -euo pipefail

RUNTIME_DIR="$(cd "$(dirname "$0")" && pwd)/.runtime"
PID_FILE="$RUNTIME_DIR/server.pid"
LOG_FILE="$RUNTIME_DIR/server.log"
PORT=8080

mkdir -p "$RUNTIME_DIR"

_is_running() {
  if [ -f "$PID_FILE" ]; then
    local pid
    pid=$(cat "$PID_FILE" 2>/dev/null || echo "")
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      return 0
    fi
  fi
  return 1
}

_start() {
  if _is_running; then
    echo "Server already running (PID $(cat "$PID_FILE")) at http://localhost:$PORT"
    return
  fi
  local dir
  dir="$(cd "$(dirname "$0")" && pwd)"

  if command -v python3 &>/dev/null; then
    python3 -m http.server $PORT --directory "$dir" > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    echo "Started with python3 (PID $!) at http://localhost:$PORT"
  elif command -v npx &>/dev/null; then
    npx --yes http-server "$dir" -p $PORT --silent > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    echo "Started with npx http-server (PID $!) at http://localhost:$PORT"
  else
    echo "ERROR: neither python3 nor npx found. Install Python 3 to run the server."
    exit 1
  fi
}

_stop() {
  if _is_running; then
    local pid
    pid=$(cat "$PID_FILE")
    kill "$pid" 2>/dev/null && echo "Stopped server (PID $pid)" || echo "Failed to stop PID $pid"
    rm -f "$PID_FILE"
  else
    echo "Server is not running."
  fi
}

_status() {
  if _is_running; then
    local pid
    pid=$(cat "$PID_FILE")
    echo "RUNNING — PID $pid — http://localhost:$PORT"
  else
    echo "NOT RUNNING"
  fi
}

_logs() {
  if [ -f "$LOG_FILE" ]; then
    tail -f "$LOG_FILE"
  else
    echo "No log file found at $LOG_FILE"
  fi
}

_test() {
  echo "=== Syntax check ==="
  local dir
  dir="$(cd "$(dirname "$0")" && pwd)"
  find "$dir/js" -name '*.js' -print0 | xargs -0 -n1 node --check && echo "All JS files OK" || echo "Syntax errors found"
  echo ""
  echo "=== Server check ==="
  if _is_running; then
    if command -v curl &>/dev/null; then
      HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/index.html" 2>/dev/null || echo "000")
      if [ "$HTTP_CODE" = "200" ]; then
        echo "http://localhost:$PORT/index.html => HTTP $HTTP_CODE OK"
      else
        echo "http://localhost:$PORT/index.html => HTTP $HTTP_CODE (may need to start server)"
      fi
    else
      echo "curl not available — server is running at http://localhost:$PORT"
    fi
  else
    echo "Server not running. Run './run.sh start' first."
  fi
}

_shell() {
  local dir
  dir="$(cd "$(dirname "$0")" && pwd)"
  cd "$dir" && exec bash
}

_clean() {
  _stop 2>/dev/null || true
  echo "Removing .runtime/ directory..."
  rm -rf "$RUNTIME_DIR"
  echo "Clean done."
}

_help() {
  cat <<EOF
CYDER-BOGS run.sh — local dev server commands

  ./run.sh start    Start static file server on :$PORT (background)
  ./run.sh up       Alias for start
  ./run.sh stop     Stop the server
  ./run.sh restart  Stop + start
  ./run.sh status   Show running/not running + PID + URL
  ./run.sh logs     Tail server log
  ./run.sh build    No-op (no build step needed)
  ./run.sh test     Syntax check all JS files; verify server responds
  ./run.sh shell    Open bash shell in project directory
  ./run.sh clean    Stop server and remove .runtime/ artifacts
  ./run.sh help     Show this help

Two ways to play:
  1. Open index.html directly in your browser (no server needed)
  2. ./run.sh start  then visit http://localhost:$PORT
EOF
}

CMD="${1:-help}"

case "$CMD" in
  start|up)     _start ;;
  stop|down)    _stop ;;
  restart)      _stop; sleep 1; _start ;;
  status)       _status ;;
  logs)         _logs ;;
  build)        echo "No build step needed for cyder-bogs." ;;
  test)         _test ;;
  shell)        _shell ;;
  clean)        _clean ;;
  help|--help|-h) _help ;;
  *)
    echo "Unknown command: $CMD"
    _help
    exit 1
    ;;
esac
