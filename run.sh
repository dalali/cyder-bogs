#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-8090}"

_build()   { docker compose -f "$DIR/docker-compose.yml" build; }
_start()   { docker compose -f "$DIR/docker-compose.yml" up -d; echo "Running at http://localhost:$PORT"; }
_stop()    { docker compose -f "$DIR/docker-compose.yml" down; }
_restart() { _stop; _start; }
_status()  { docker compose -f "$DIR/docker-compose.yml" ps; }
_logs()    { docker compose -f "$DIR/docker-compose.yml" logs -f; }
_test() {
  echo "=== JS syntax check ==="
  find "$DIR/js" -name '*.js' -print0 | xargs -0 -n1 node --check && echo "All JS files OK"
  echo ""
  echo "=== HTTP check ==="
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/index.html" 2>/dev/null || echo "000")
  echo "http://localhost:$PORT/index.html => HTTP $CODE"
}
_shell()   { docker compose -f "$DIR/docker-compose.yml" exec game sh; }
_clean()   { docker compose -f "$DIR/docker-compose.yml" down --rmi local --volumes; }

_help() {
  cat <<EOF
cyder-bogs — Docker Compose runner

  ./run.sh build    Build the image
  ./run.sh start    Start container (http://localhost:$PORT)
  ./run.sh up       Alias for start
  ./run.sh stop     Stop and remove container
  ./run.sh down     Alias for stop
  ./run.sh restart  Stop + start
  ./run.sh status   Show container state
  ./run.sh logs     Follow container logs
  ./run.sh test     JS syntax check + HTTP smoke test
  ./run.sh shell    Shell into running container
  ./run.sh clean    Stop + remove container and image
  ./run.sh help     Show this help

Quick start:
  ./run.sh build && ./run.sh start
  open http://localhost:$PORT
EOF
}

CMD="${1:-help}"
case "$CMD" in
  build)          _build ;;
  start|up)       _start ;;
  stop|down)      _stop ;;
  restart)        _restart ;;
  status)         _status ;;
  logs)           _logs ;;
  test)           _test ;;
  shell)          _shell ;;
  clean)          _clean ;;
  help|--help|-h) _help ;;
  *)
    echo "Unknown command: $CMD"
    _help
    exit 1
    ;;
esac
