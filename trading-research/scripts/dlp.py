import os, sys, time, datetime as dt, subprocess, random
from concurrent.futures import ThreadPoolExecutor
out = sys.argv[1]; W = int(sys.argv[2])
syms = ["USATECHIDXUSD"]
start, end = dt.date(2026, 3, 30), dt.date(2026, 10, 6)
jobs = []
d = start
while d <= end:
    if d.weekday() != 5:
        for s in syms: jobs.append((s, d))
    d += dt.timedelta(1)

def get(j):
    s, d = j; os.makedirs(f"{out}/{s}", exist_ok=True); f = f"{out}/{s}/{d.isoformat()}.bi5"
    if os.path.exists(f): return 1
    url = f"https://datafeed.dukascopy.com/datafeed/{s}/{d.year}/{d.month-1:02d}/{d.day:02d}/BID_candles_min_1.bi5"
    for a in range(40):
        r = subprocess.run(["curl", "-sS", "--max-time", "25", "-A", "Mozilla/5.0", "-o", f + ".tmp", "-w", "%{http_code}", url], capture_output=True, text=True)
        if r.stdout.strip() == "200": os.replace(f + ".tmp", f); return 1
        if r.stdout.strip() == "404": open(f, "wb").close(); return 1
        time.sleep(random.uniform(1, 5))
    print("FAIL", s, d, flush=True); return 0

with ThreadPoolExecutor(W) as ex: print("ok", sum(ex.map(get, jobs)), "of", len(jobs), flush=True)
