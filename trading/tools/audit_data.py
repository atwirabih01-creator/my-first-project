"""Check a price file before trusting it: is the clock right, and which months have missing hours?

Usage: python3 trading/tools/audit_data.py <file.csv.gz> [<file2> ...]
- Clock: the 09:30 New York stock open (Nasdaq) and the 08:30 New York US-data releases (all markets)
  must show up at exactly those minutes. Reports, per year, the minute with the biggest jump
  in activity among 07:30 / 08:30 / 09:30 / 10:30 New York.
- Gaps: counts weekdays per month with a hole of more than 15 minutes between 03:00 and 16:00 New York
  (London + New York sessions), the hours our strategies use.
"""
import sys
import pandas as pd


def audit(path):
    df = pd.read_csv(path, parse_dates=["time_utc"])
    ny = df.time_utc.dt.tz_localize("UTC").dt.tz_convert("America/New_York")
    df["mins"] = ny.dt.hour * 60 + ny.dt.minute
    df["r"] = df.high - df.low
    df["yr"] = ny.dt.year
    df["mo"] = ny.dt.strftime("%Y-%m")
    df["d"] = ny.dt.date
    print(f"\n== {path}: {len(df)} bars, {df.time_utc.min()} -> {df.time_utc.max()} UTC")
    for yr, x in df.groupby("yr"):
        g = x.groupby("mins").r.mean()
        jump = {f"{h:02d}:30": g.loc[h * 60 + 30:h * 60 + 34].mean() / g.loc[h * 60 + 20:h * 60 + 29].mean()
                for h in (7, 8, 9, 10)}
        best = max(jump, key=jump.get)
        print(f"  {yr}: biggest activity jump at {best} NY ({jump[best]:.1f}x)")
    s = df[(df.mins >= 180) & (df.mins < 960) & (ny.dt.dayofweek < 5)]
    gap = s.groupby("d").time_utc.apply(lambda t: t.diff().max() > pd.Timedelta(minutes=15))
    bad = gap[gap]
    months = pd.Series([str(d)[:7] for d in bad.index]).value_counts().sort_index()
    heavy = months[months >= 5]
    print(f"  days with >15-min holes: {len(bad)} of {len(gap)}; months with 5+ such days: "
          + (", ".join(f"{m} ({n})" for m, n in heavy.items()) if len(heavy) else "none"))


if __name__ == "__main__":
    for p in sys.argv[1:]:
        audit(p)
