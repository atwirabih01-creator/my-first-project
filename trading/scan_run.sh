#!/usr/bin/env bash
# One cheap scanner run (no AI agents): update the paper journal, refresh the gate weekly, scan 40 coins.
# Prints "CANDIDATES=<n>" and "PASSED=<yes|no>" as its last two lines.
set -u
cd "$(dirname "$0")"
python3 desk_journal.py update
python3 desk_journal.py score | tee /tmp/desk_score.txt
stale=$(python3 -c "import json,pandas as pd; g=json.load(open('journal/gate.json')); print(int((pd.Timestamp.now(tz='UTC')-pd.Timestamp(g['built_utc'])).days>=7))" 2>/dev/null || echo 1)
if [ "$stale" = "1" ]; then
  python3 gate.py | tail -3
fi
python3 scanner.py | tee /tmp/desk_scan.txt
n=$(python3 -c "import json; print(len(json.load(open('journal/latest_scan.json'))['candidates']))")
echo "- $(date -u '+%Y-%m-%d %H:%M') UTC — scan: ${n} candidate(s)" >> journal/scan_log.md
echo "CANDIDATES=${n}"
if grep -q "True" /tmp/desk_score.txt; then echo "PASSED=yes"; else echo "PASSED=no"; fi
