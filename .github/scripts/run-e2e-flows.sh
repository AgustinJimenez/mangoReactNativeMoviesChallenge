#!/usr/bin/env bash
# Extracted out of ci.yml's e2e job because reactivecircus/android-emulator-runner's
# `script:` input does not execute a multi-line block as one cohesive script — each
# line runs as its own independent `sh -c` invocation, so an `if`/`for` spanning
# multiple lines has no way to find its `fi`/`done` (confirmed by CI's exact error:
# `sh -c if [ -z "" ]; then` failing on its own, immediately after a separate,
# successful `sh -c adb install ...`). A real script file sidesteps that entirely.
set -euo pipefail

adb install -r android/app/build/outputs/apk/debug/app-debug.apk

if [ -z "${TMDB_ACCESS_TOKEN:-}" ]; then
  echo "TMDB_ACCESS_TOKEN not set — running only the flow that doesn't call the TMDB API"
  maestro test .maestro/language-switch.yaml
else
  # Run one flow at a time rather than `maestro test .maestro/`: all four
  # flows share the same appId, and pointing Maestro at the whole directory
  # runs them concurrently against this one emulator, racing each other for
  # the same app instance.
  for flow in .maestro/*.yaml; do
    maestro test "$flow"
  done
fi
