#!/usr/bin/env bash
# One cheap scanner run (no AI agents): update the paper journal, refresh the gate weekly, scan 40 coins.
# Prints STUDY_SESSION, GRADUATED, CANDIDATES=<n>, CARRY_CANDIDATES=<n> and PASSED=<yes|no> as its last five lines.
# STUDY_SESSION=yes on every run (owner, 30 Oct 2026: faster practice): hold a study session (.claude/skills/desk-training/SKILL.md).
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
python3 carry_live.py update
python3 carry_live.py scan | tee /tmp/desk_carry.txt
python3 carry_live.py score | tee -a /tmp/desk_score.txt
c=$(python3 -c "import json; print(len(json.load(open('journal/carry_scan.json'))['candidates']))")
python3 calls.py score
python3 account.py | tee /tmp/desk_account.txt
echo "- $(date -u '+%Y-%m-%d %H:%M') UTC — scan: ${n} candidate(s), carry: ${c} candidate(s)" >> journal/scan_log.md
echo "STUDY_SESSION=yes"
grep "^GRADUATED=" /tmp/desk_account.txt || echo "GRADUATED=no"
echo "CANDIDATES=${n}"
echo "CARRY_CANDIDATES=${c}"
if grep -q "True" /tmp/desk_score.txt; then echo "PASSED=yes"; else echo "PASSED=no"; fi
