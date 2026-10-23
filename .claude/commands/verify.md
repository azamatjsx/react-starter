---
description: Run format, lint, type check, unit tests, build and E2E, then report
allowed-tools: Bash(vp check:*), Bash(vp run lint:fsd), Bash(vp test:*), Bash(vp run build), Bash(vp run test:e2e)
---

Verify the project in this order and stop at the first failing step:

1. `vp check` (format, lint, type check)
2. `vp run lint:fsd` (Feature-Sliced Design rules, Steiger)
3. `vp test` (unit tests)
4. `vp run build`
5. `vp run test:e2e`

Report one line per step: pass or fail. For a failure, quote the shortest error line that explains it and name the file and line. Do not fix anything unless I ask.

$ARGUMENTS
