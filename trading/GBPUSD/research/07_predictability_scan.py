"""Does an earlier part of the day predict a later part? Simple sign/correlation scan.
Each pair: feature = move over an earlier window, target = move over a later window (pips).
Reports correlation, hit rate of 'follow the sign', average signed follow-through, and the two halves."""
from common import *
from levels import day_table

df = load()
days = day_table(df)
cd = days[days.complete & days.pdh.notna()]
D = df[df.tday.isin(cd.index)]

def price_at(g, clock, minute):
    col = "ldn_min" if clock == "L" else "ny_min"
    x = g[(g[col] == minute) & g.ldn_today] if clock == "L" else g[(g[col] == minute) & (g.ldn_today | (g.ny_min < 1020))]
    x = x[x.ldn_today]
    return x.open.iloc[0] if len(x) else np.nan

pts = {"dayopen": None, "L0": ("L", 0), "L7": ("L", 420), "L8": ("L", 480), "L9": ("L", 540), "L12": ("L", 720),
       "N8": ("N", 480), "N9": ("N", 540), "N930": ("N", 570), "N10": ("N", 600), "N11": ("N", 660), "L16": ("L", 960),
       "N12": ("N", 720), "N1659": ("N", 1019)}
rows = []
for tday, g in D.groupby("tday"):
    r = {"tday": tday}
    for k, v in pts.items():
        r[k] = g.open.iloc[0] if v is None else price_at(g, *v)
    r["dayclose"] = g.close.iloc[-1]
    rows.append(r)
P = pd.DataFrame(rows).set_index("tday")
P["prevday"] = (P.dayclose - P.dayopen).shift(1) / PIP

pairs = [("prev day", "prevday", None, "dayopen", "dayclose"),
         ("Asia (00-07 Ldn) -> 07-12 Ldn", "L0", "L7", "L7", "L12"),
         ("evening+Asia (17:00 NY-07 Ldn) -> 07 Ldn-17 NY", "dayopen", "L7", "L7", "dayclose"),
         ("London 1st hour 08-09 -> 09-12 Ldn", "L8", "L9", "L9", "L12"),
         ("London morning 08-12 Ldn -> 12 Ldn-17 NY", "L8", "L12", "L12", "dayclose"),
         ("08 Ldn-08 NY -> 08 NY-17 NY", "L8", "N8", "N8", "dayclose"),
         ("day open->08 NY -> 08 NY-17 NY", "dayopen", "N8", "N8", "dayclose"),
         ("NY 08-09 -> 09-12 NY", "N8", "N9", "N9", "N12"),
         ("NY 08-10 -> 10-17 NY", "N8", "N10", "N10", "dayclose"),
         ("08 NY->16:00 Ldn fix -> fix-17 NY", "N8", "L16", "L16", "dayclose"),
         ("day open->12 NY -> 12-17 NY", "dayopen", "N12", "N12", "dayclose")]
print(f"{'pair':48s} {'n':>4s} {'corr':>6s} {'follow%':>8s} {'avg follow pips':>16s} {'half1':>7s} {'half2':>7s}")
for name, a, b, c, d in pairs:
    f = P[a] if b is None else (P[b] - P[a]) / PIP
    t = (P[d] - P[c]) / PIP
    m = f.notna() & t.notna() & (f != 0)
    f, t = f[m], t[m]
    fol = np.sign(f) * t
    h = f.index < "2026-02-15"
    print(f"{name:48s} {len(f):4d} {np.corrcoef(f, t)[0,1]:+6.2f} {(fol > 0).mean():8.0%} {fol.mean():+16.1f} {fol[h].mean():+7.1f} {fol[~h].mean():+7.1f}")
