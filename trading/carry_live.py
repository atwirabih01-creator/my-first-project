"""Live PAPER funding-carry playbook (market-neutral): buy the coin on Binance spot, bet against it by
the same amount on a futures venue (OKX or Hyperliquid), collect funding. Places NO orders.

Same rules as the design-tested carry (carry.py), on funding normalised to 8-hour periods:
  C1  enter when the average of the last 9 eight-hour funding prints is >= 20%/yr; exit when it falls
      to <= 0, or after 14 days                                   (design: 364 trades, 91.5% wins)
  C2  enter when the last 3 prints are all >= 0.03% per 8h; exit after 2 prints < 0.005%, or 14 days
                                                                  (design "research" rule: 98% wins)
  C3  like C1 but needs >= 40%/yr                                 (design: 201 trades, 97.5% wins)
  C4  average of the last 21 prints >= 12%/yr; hold a fixed 30 days (design: 279 trades, 92% wins;
      sealed 2026 exam: 2 trades, both wins - too few to count)
Costs 0.30% per round trip; a win is > +0.10% after costs. Both legs valued at real prices.

  python3 carry_live.py scan                   # which coin/venue/version meets its entry rule now
  python3 carry_live.py add COIN VENUE "atlas" "hawk" "sage"   # record an agreed carry (all versions whose rule is met)
  python3 carry_live.py update                 # accrue funding, close trades whose exit rule is met
  python3 carry_live.py score
"""
import csv, json, sys, time, urllib.request
from pathlib import Path
import numpy as np
import pandas as pd
import fetch_data as F
from fetch_futures import PAIRS

HERE = Path(__file__).parent
TRADES = HERE / "journal" / "carry_trades.csv"
SCAN = HERE / "journal" / "carry_scan.json"
COST, WIN_MIN = 0.0030, 0.0010
UA = {"User-Agent": "Mozilla/5.0"}
COINS = sorted({spot[:-4] for spot, _ in PAIRS.values()})
HL_NAME = {"PEPE": "kPEPE", "SHIB": "kSHIB", "BONK": "kBONK", "FLOKI": "kFLOKI"}     # 1000-coin units on HL
HL_MULT = {"PEPE": 1000, "SHIB": 1000, "BONK": 1000, "FLOKI": 1000}
VERSIONS = {
    "C1": dict(kind="avg", k=9, enter=0.20, exit=0.0, max_days=14),
    "C2": dict(kind="research", max_days=14),
    "C3": dict(kind="avg", k=9, enter=0.40, exit=0.0, max_days=14),
    "C4": dict(kind="avg", k=21, enter=0.12, exit=-9.0, max_days=30),   # design 279 trades, 92% wins; 2026 exam 2/2 wins
}
COLS = ["id", "version", "coin", "venue", "opened_utc", "spot0", "perp0", "status", "closed_utc", "funding",
        "spot_ret", "perp_ret", "result_pct"]


def _get(url, data=None):
    req = urllib.request.Request(url, data=json.dumps(data).encode() if data else None,
                                 headers={**UA, "Content-Type": "application/json"})
    for attempt in range(4):
        try:
            return json.load(urllib.request.urlopen(req, timeout=30))
        except Exception:
            time.sleep(2 ** attempt)
    raise RuntimeError(f"failed {url}")


def funding(coin, venue, since):
    """Funding prints since `since` (UTC), as a fraction per 8 hours, indexed by time."""
    t0 = int(pd.Timestamp(since).timestamp() * 1000)
    if venue == "OKX":
        rows, after = [], None
        while True:
            u = f"https://www.okx.com/api/v5/public/funding-rate-history?instId={coin}-USDT-SWAP&limit=100"
            b = _get(u + (f"&after={after}" if after else "")).get("data", [])
            if not b:
                break
            rows += b
            after = b[-1]["fundingTime"]
            if int(after) <= t0:
                break
        s = pd.Series({pd.Timestamp(int(r["fundingTime"]), unit="ms", tz="UTC"): float(r["realizedRate"] or r["fundingRate"])
                       for r in rows}).sort_index()
        gap = s.index.to_series().diff().dt.total_seconds().median() / 3600 if len(s) > 2 else 8
        return (s * (8 / gap))[s.index >= pd.Timestamp(since)]
    rows, t = [], t0
    while True:
        b = _get("https://api.hyperliquid.xyz/info", {"type": "fundingHistory", "coin": HL_NAME.get(coin, coin), "startTime": t})
        if not b:
            break
        rows += b
        if len(b) < 500:
            break
        t = b[-1]["time"] + 1
        time.sleep(0.3)
    s = pd.Series({pd.Timestamp(r["time"], unit="ms", tz="UTC").floor("h"): float(r["fundingRate"]) for r in rows}).sort_index()
    return s.resample("8h").sum(min_count=1).dropna()      # 8 hourly prints -> one 8-hour print


def perp_price(coin, venue):
    if venue == "OKX":
        return float(_get(f"https://www.okx.com/api/v5/market/ticker?instId={coin}-USDT-SWAP")["data"][0]["last"])
    m, ctx = _get("https://api.hyperliquid.xyz/info", {"type": "metaAndAssetCtxs"})
    names = [u["name"] for u in m["universe"]]
    return float(ctx[names.index(HL_NAME.get(coin, coin))]["markPx"]) / HL_MULT.get(coin, 1)


def spot_price(coin):
    end = int(time.time() * 1000)
    return float(F.fetch(f"{coin}USDT", end - 3 * 3600 * 1000, end).close.iloc[-1])


def entry_ok(per8, v):
    if v["kind"] == "avg":
        return len(per8) >= v["k"] and per8.iloc[-v["k"]:].mean() * 3 * 365 >= v["enter"]
    return len(per8) >= 3 and per8.iloc[-3:].min() >= 0.0003


def exit_ok(per8, v):
    if v["kind"] == "avg":
        return per8.iloc[-v["k"]:].mean() * 3 * 365 <= v["exit"]
    return len(per8) >= 2 and (per8.iloc[-2:] < 0.00005).all()


def scan():
    since = pd.Timestamp.now(tz="UTC") - pd.Timedelta(days=8)
    out = []
    for coin in COINS:
        for venue in ("OKX", "HL"):
            try:
                per8 = funding(coin, venue, since)
                time.sleep(0.4)                              # be polite to the free APIs
            except Exception:
                continue
            if len(per8) < 3:
                continue
            hits = [n for n, v in VERSIONS.items() if entry_ok(per8, v)]
            out.append({"coin": coin, "venue": venue, "yearly_last9": round(float(per8.iloc[-9:].mean() * 3 * 365), 4),
                        "last3_per8h": [round(float(x), 6) for x in per8.iloc[-3:]], "versions": hits})
    cands = [o for o in out if o["versions"]]
    SCAN.write_text(json.dumps({"scanned_utc": str(pd.Timestamp.now(tz="UTC").floor("min")), "candidates": cands,
                                "hottest": sorted(out, key=lambda o: -o["yearly_last9"])[:8]}, indent=1))
    print(f"carry scan: {len(out)} coin/venue pairs, candidates: {len(cands)}")
    for o in sorted(out, key=lambda o: -o["yearly_last9"])[:5]:
        print(f"  {o['coin']:6s} {o['venue']:3s} funding {o['yearly_last9']:+.1%}/yr  versions {o['versions']}")
    return cands


def _read():
    return pd.read_csv(TRADES, keep_default_na=False, dtype=str) if TRADES.exists() else pd.DataFrame(columns=COLS)


def add(coin, venue, atlas, hawk, sage):
    t = _read()
    if len(t) and ((t.coin == coin) & (t.status == "open")).any():
        print(f"skipped: {coin} already has an open carry"); return
    since = pd.Timestamp.now(tz="UTC") - pd.Timedelta(days=8)
    per8 = funding(coin, venue, since)
    vs = [n for n, v in VERSIONS.items() if entry_ok(per8, v)]
    if not vs:
        print("no version's entry rule is met now"); return
    now = pd.Timestamp.now(tz="UTC").floor("min")
    s0, p0 = spot_price(coin), perp_price(coin, venue)
    new = not TRADES.exists()
    with open(TRADES, "a", newline="") as fh:
        w = csv.writer(fh)
        if new:
            w.writerow(COLS)
        for n in vs:
            w.writerow([f"{now:%Y%m%d%H%M}-{coin}-{venue}", n, coin, venue, now, s0, p0, "open", "", "", "", "", ""])
    with open(HERE / "journal" / "carry_reasons.csv", "a", newline="") as fh:
        csv.writer(fh).writerow([now, coin, venue, ",".join(vs), atlas, hawk, sage])
    print(f"recorded carry {coin} on {venue}: spot {s0}, futures {p0}, versions {vs}")


def update():
    t = _read()
    if not len(t):
        print("no carry trades yet"); return
    for i in t.index[t.status == "open"]:
        r = t.loc[i]
        opened = pd.Timestamp(r.opened_utc)
        per8 = funding(r.coin, r.venue, opened - pd.Timedelta(days=4))
        received = float(per8[per8.index > opened].sum())
        s1, p1 = spot_price(r.coin), perp_price(r.coin, r.venue)
        sr, pr = s1 / float(r.spot0) - 1, p1 / float(r.perp0) - 1
        pnl = received + sr - pr - COST
        v = VERSIONS[r.version]
        held = (pd.Timestamp.now(tz="UTC") - opened).total_seconds() / 86400
        t.loc[i, ["funding", "spot_ret", "perp_ret"]] = [f"{received:.6f}", f"{sr:.6f}", f"{pr:.6f}"]
        if held >= v["max_days"] or (len(per8[per8.index > opened]) >= 1 and exit_ok(per8, v)):
            t.loc[i, ["status", "closed_utc", "result_pct"]] = ["closed", str(pd.Timestamp.now(tz="UTC").floor("min")),
                                                                 f"{100 * pnl:.3f}"]
    t.to_csv(TRADES, index=False)
    print(f"carry trades: {int((t.status == 'open').sum())} open, {int((t.status == 'closed').sum())} closed")


def score():
    t = _read()
    rows = []
    for n in VERSIONS:
        c = t[(t.version == n) & (t.status == "closed")] if len(t) else t
        r = c.result_pct.astype(float).values / 100 if len(c) else np.array([])
        eq = np.cumprod(1 + 0.10 * r) if len(r) else np.array([1.0])
        dd = float((1 - eq / np.maximum.accumulate(eq)).max() * 100)
        pf = float(r[r > 0].sum() / -r[r <= 0].sum()) if (r <= 0).any() and r[r <= 0].sum() < 0 else (99.0 if len(r) else 0.0)
        first = r[:100]
        ok = bool(len(r) >= 100 and (first > WIN_MIN).sum() >= 80 and first.sum() > 0 and pf >= 1.2 and dd <= 10)
        rows.append({"version": n, "closed": len(r), "open": int(((t.version == n) & (t.status == "open")).sum()) if len(t) else 0,
                     "wins": int((r > WIN_MIN).sum()), "profit_%": round(100 * (eq[-1] - 1), 2),
                     "profit_per_$1_lost": round(pf, 2), "biggest_drop_%": round(dd, 2), "PASSED": ok})
    print(pd.DataFrame(rows).to_string(index=False))


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "scan"
    {"scan": scan, "update": update, "score": score}.get(cmd, lambda: add(*sys.argv[2:]))()
