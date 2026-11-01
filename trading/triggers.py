"""Check the pre-declared trigger set (journal/triggers.json) for the "trigger calls" trial. Places NO orders.

A trigger has FIRED when the last two finished Binance 1h closes are both beyond its level, and is still
VALID if the latest finished close is beyond it. Prints one line per trigger and TRIGGERS_FIRED=<n>.

  python3 triggers.py
"""
import json, time, urllib.request
from pathlib import Path

HERE = Path(__file__).parent
URL = "https://data-api.binance.vision/api/v3/klines?symbol={}&interval=1h&limit=4"


def closes(sym):
    rows = json.load(urllib.request.urlopen(URL.format(sym), timeout=20))
    now_ms = time.time() * 1000
    return [float(r[4]) for r in rows if r[6] < now_ms][-2:]          # finished bars only


if __name__ == "__main__":
    cfg = json.load(open(HERE / "journal" / "triggers.json"))
    fired = 0
    for t in cfg["triggers"]:
        c = closes(t["symbol"])
        beyond = [x > t["level"] if t["dir"] == "up" else x < t["level"] for x in c]
        ok = len(c) == 2 and all(beyond)
        fired += ok
        print(f'{t["symbol"]:9s} {t["dir"]:4s} {t["level"]:<12g} last closes {c}  {"FIRED" if ok else "-"}')
    print(f"TRIGGERS_FIRED={fired}")
