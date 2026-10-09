"""Is the New York first hour (08:00-09:00 NY, incl. 08:30 US data) partly undone afterwards? Split by size and year."""
from common import *
from levels import day_table

df = load()
days = day_table(df)
cd = days[days.complete & days.prev_complete]
D = df[df.tday.isin(cd.index) & df.ldn_today]
rows = []
for tday, g in D.groupby("tday"):
    N = g.ny_min.values
    def px(m):
        i = np.where(N == m)[0]
        return g.open.values[i[0]] if len(i) else np.nan
    rows.append(dict(tday=tday, a=px(480), b=px(540), c=px(720), e=px(960)))
P = pd.DataFrame(rows).dropna()
P["year"] = year_of(P.tday)
P["m1"] = (P.b - P.a) / PIP; P["m12"] = (P.c - P.b) / PIP; P["m16"] = (P.e - P.b) / PIP
P["fade12"] = -np.sign(P.m1) * P.m12; P["fade16"] = -np.sign(P.m1) * P.m16
for y, g in P.groupby("year"):
    print(f"== {y} (n={len(g)})")
    for lo_, hi_ in [(0, 10), (10, 20), (20, 30), (30, 999)]:
        s = g[(g.m1.abs() >= lo_) & (g.m1.abs() < hi_)]
        print(f"  first-hour move {lo_:>2}-{hi_:<3} pips n={len(s):3d}: fade 09->12 right {(s.fade12 > 0).mean():.0%} avg {s.fade12.mean():+5.1f} | fade 09->16 avg {s.fade16.mean():+5.1f}")
