#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

FAILED=()
PASSED=()
SKIPPED=()

run_tests() {
  local dir="$1"
  local cmd="$2"
  local label="$3"

  echo ""
  echo "============================================"
  echo "  Running tests: $label"
  echo "  Directory: $dir"
  echo "  Command:   $cmd"
  echo "============================================"

  if (cd "$SCRIPT_DIR/$dir" && eval "$cmd"); then
    PASSED+=("$label")
  else
    FAILED+=("$label")
  fi
}

# frontends/services
run_tests "frontends/services" "npm test" "services"

# frontends/admin
run_tests "frontends/admin" "npm test" "admin"

# apis/api-mono/api — npm test includes lint; use test:unit for unit tests only
run_tests "apis/api-mono/api" "npm run test:unit" "api-mono"

# ------------------------------------------------------------
# Frontend builds — catch build breakage before it hits the
# GitHub Actions runner. The API is NOT built here: Docker owns
# its build folder, so it can't be built from the host.
# ------------------------------------------------------------
run_tests "frontends/admin" "npm run build" "admin (build)"
run_tests "frontends/user-main" "npm run build" "user-main (build)"

echo ""
echo "============================================"
echo "  RESULTS SUMMARY"
echo "============================================"

if [ ${#PASSED[@]} -gt 0 ]; then
  echo ""
  echo "PASSED (${#PASSED[@]}):"
  for p in "${PASSED[@]}"; do echo "  ✓ $p"; done
fi

if [ ${#SKIPPED[@]} -gt 0 ]; then
  echo ""
  echo "SKIPPED (${#SKIPPED[@]}):"
  for s in "${SKIPPED[@]}"; do echo "  - $s"; done
fi

if [ ${#FAILED[@]} -gt 0 ]; then
  echo ""
  echo "FAILED (${#FAILED[@]}):"
  for f in "${FAILED[@]}"; do echo "  ✗ $f"; done
  echo ""
  exit 1
fi

echo ""
echo "All tests passed!"
