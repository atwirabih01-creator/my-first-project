"""Score the CONFIRMATION rounds (6-11) with the pre-declared team rule (journal/lessons.md, fixed before
those rounds were made): TAKE only when Hawk says TAKE and Atlas does not say "warns"
(Sage's hard limits: one per BTC moment is already enforced by Hawk). Writes round<N>_decisions.csv.

  python3 confirm.py 6 7 8 ...
"""
import re, sys, subprocess
from pathlib import Path
D = Path(__file__).parent / "journal" / "replay"
for r in sys.argv[1:]:
    h = {m.group(1): m.group(2) for m in re.finditer(rf"(R{r}-\d\d)\s*\|\s*chart:\s*(\w+)", (D / f"round{r}_hawk.md").read_text())}
    a = {m.group(1): m.group(2) for m in re.finditer(rf"(R{r}-\d\d)\s*\|\s*context:\s*(\w+)", (D / f"round{r}_atlas.md").read_text())}
    with open(D / f"round{r}_decisions.csv", "w") as f:
        f.write("case,decision,reason\n")
        for c in sorted(h):
            take = h[c] == "TAKE" and a.get(c) != "warns"
            f.write(f"{c},{'TAKE' if take else 'SKIP'},Hawk {h[c]} / Atlas {a.get(c)} (pre-declared rule)\n")
    subprocess.run([sys.executable, "replay.py", "score", r, str(D / f"round{r}_decisions.csv")], cwd=D.parent.parent,
                   stdout=subprocess.DEVNULL)
    print("scored round", r)
