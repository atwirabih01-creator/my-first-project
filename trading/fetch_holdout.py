"""Download one sealed holdout set (A, B or C) into data_holdout_<set>/."""
import json, sys, time
from pathlib import Path
import fetch_data as F
k = sys.argv[1]
syms = json.load(open(Path(__file__).parent / "results/holdout_sets.json"))[k]
out = Path(__file__).parent / f"data_holdout_{k}"; out.mkdir(exist_ok=True)
end = int(time.time() * 1000); start = end - 1095 * 86400 * 1000
for s in syms:
    df = F.fetch(s, start, end); df.to_pickle(out / f"{s}.pkl"); print(s, len(df), flush=True)
print("DONE", flush=True)
