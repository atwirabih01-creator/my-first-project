"""Download a share of the extra markets: python3 fetch_many.py <worker> <workers>."""
import json, sys, time
from pathlib import Path
import fetch_data as F
w, W = int(sys.argv[1]), int(sys.argv[2])
H = Path(__file__).parent
sets = json.load(open(H / "results/holdout_sets.json"))
first15 = {"A": 15, "B": 15, "C": 15, "P": 0}
jobs = [(k, s) for k in "PABC" for s in sets[k][first15[k]:]]
end = int(time.time() * 1000); start = end - 1095 * 86400 * 1000
for n, (k, s) in enumerate(jobs):
    if n % W != w: continue
    folder = H / ("data_practice" if k == "P" else f"data_holdout_{k}"); folder.mkdir(exist_ok=True)
    if (folder / f"{s}.pkl").exists(): continue
    try:
        df = F.fetch(s, start, end); df.to_pickle(folder / f"{s}.pkl"); print(k, s, len(df), flush=True)
    except Exception as e:
        print("FAIL", k, s, e, flush=True)
print("DONE", flush=True)
