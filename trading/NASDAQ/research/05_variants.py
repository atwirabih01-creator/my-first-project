"""05: PRE-DECLARED variants of the 'fade the big opening gap' idea (declared in this header BEFORE the first run).
Common: gap = 09:30 NY open price - previous day's 16:00 close (15:59 bar close). Trade only if |gap| > 0.5 x ATR
(ATR = average 09:30-16:00 range of the previous 14 full sessions, in points). Direction = AGAINST the gap
(gap up -> short, gap down -> long). One trade per day max. Forced close: close of the 15:59 NY bar.
  V1  enter at close of the first 5-min candle (09:30-09:35); stop 0.5 ATR from entry; target = previous 16:00 close (gap fill).
      Skip if price already reached the previous close by 09:35.
  V2  as V1 but stop 0.75 ATR.
  V3  as V1 but no target (exit at stop or 15:59 only).
  V4  confirmation: wait for a 5-min candle (closing 09:40 .. 10:30) that CLOSES beyond the first 5-min candle's
      low (gap up) / high (gap down); enter at its close; stop = RTH high (gap up) / low (gap down) so far + 0.1 ATR buffer,
      at least 40 points; target = previous 16:00 close; skip if already filled.
Variant count for NASDAQ starts here: 4.
"""
from sim import *
import sys
VAR = {"V1": dict(stop=0.5, tgt=True), "V2": dict(stop=0.75, tgt=True), "V3": dict(stop=0.5, tgt=False), "V4": dict(conf=True)}
def run(name, p, th=0.5):
    out = []
    for t, r in TRADE_DAYS.iterrows():
        d = G[t]; atr = r.atr_pct / 100 * r.o930
        gap = r.o930 - r.pdc
        if abs(gap) <= th * atr: continue
        side = -1 if gap > 0 else 1
        b5 = bars(d, 5, 570, 960)
        if not b5 or b5[0][5] != 570: continue
        first = b5[0]
        if p.get("conf"):
            hi_so, lo_so = first[2], first[3]; ent = None
            for k in range(1, len(b5)):
                bb = b5[k]
                if bb[5] + 5 > 630: break
                hi_so, lo_so = max(hi_so, bb[2]), min(lo_so, bb[3])
                if (side == 1 and hi_so >= r.pdc) or (side == -1 and lo_so <= r.pdc): break  # filled already
                if (side == -1 and bb[4] < first[3]) or (side == 1 and bb[4] > first[2]):
                    ent = bb; break
            if ent is None: continue
            entry = ent[4]
            stop = hi_so + 0.1 * atr if side == -1 else lo_so - 0.1 * atr
            if abs(entry - stop) < 40: stop = entry + 40 * (-side)
            i0 = ent[0] + 1; tgt = r.pdc
        else:
            if (side == 1 and first[2] >= r.pdc) or (side == -1 and first[3] <= r.pdc): continue
            entry = first[4]; stop = entry - side * p["stop"] * atr; i0 = first[0] + 1
            tgt = r.pdc if p["tgt"] else None
        g, why, ix = walk(d, i0, side, entry, stop, tgt)
        out.append(dict(tday=t, side=side, entry=entry, stop=stop, risk=abs(entry - stop), gross=g, why=why, gap_atr=gap / atr))
    return pd.DataFrame(out)
if __name__ == "__main__":
    for k, p in VAR.items():
        T = run(k, p); report(k, T)
        T.to_csv(f"out_05_{k}.csv", index=False)
