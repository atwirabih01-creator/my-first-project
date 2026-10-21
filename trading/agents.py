"""The three trading agents, written as rules a computer can test on price history.

Atlas  (Agent 1, the Researcher)  - reads trend, money flow and the whole market's mood.
Hawk   (Agent 2, the Sniper)      - waits for the exact trigger moment and sets the entry,
                                    stop-loss and profit target.
Sage   (Agent 3, the Professor)   - checks risk, estimates the chance of a win from past
                                    data, and gives the final yes or no.

A trade happens only when all three say yes.
"""
from dataclasses import dataclass, field
import numpy as np
import pandas as pd


# ---------- small indicator helpers ----------

def ema(s, n):
    return s.ewm(span=n, adjust=False).mean()


def rsi(close, n=14):
    d = close.diff()
    up = d.clip(lower=0).ewm(alpha=1 / n, adjust=False).mean()
    dn = (-d.clip(upper=0)).ewm(alpha=1 / n, adjust=False).mean()
    return 100 - 100 / (1 + up / dn.replace(0, np.nan))


def atr(df, n=14):
    pc = df["close"].shift()
    tr = pd.concat([df["high"] - df["low"], (df["high"] - pc).abs(), (df["low"] - pc).abs()], axis=1).max(axis=1)
    return tr.ewm(alpha=1 / n, adjust=False).mean()


def zscore(s, n):
    return (s - s.rolling(n).mean()) / s.rolling(n).std()


# ---------- the settings that make one "version" of the team ----------

@dataclass
class Version:
    name: str
    # Atlas
    trend_fast: int = 50
    trend_slow: int = 200
    flow_window: int = 24          # hours of taker-buy pressure to look at
    atlas_min_score: float = 0.5   # how convinced Atlas must be (0..1)
    need_btc_tide: bool = True     # only go with the overall crypto market's direction
    # Hawk
    setups: tuple = ("pullback",)  # pullback / breakout / shock
    rsi_dip: float = 40
    breakout_hours: int = 48
    vol_z: float = 2.0
    stop_atr: float = 2.0
    target_atr: float = 2.0
    max_hold: int = 48             # hours before Hawk closes a trade that went nowhere
    allow_short: bool = False
    # Sage
    min_prob: float = 0.80         # Sage's win-probability bar
    max_stretch_atr: float = 3.0   # refuse to chase price far above its average
    max_vol_pct: float = 0.95      # refuse when volatility is in its wildest 5%
    cooldown: int = 6              # bars (chart candles) to wait after a loss on the same market
    sage_kind: str = "logit"       # logit = overall statistics model, knn = "most similar past trades"
    knn_k: int = 60
    # general
    bar_hours: int = 1             # 1 = hourly chart, 4 = four-hour chart
    min_target_pct: float = 0.0    # Hawk skips trades whose profit target is too small to beat fees
    extra: dict = field(default_factory=dict)


# ---------- Agent 1: Atlas, the Researcher ----------

def atlas(df, btc, v: Version):
    """Scores each hour from -1 (strongly bearish) to +1 (strongly bullish)."""
    c = df["close"]
    f, s = ema(c, v.trend_fast), ema(c, v.trend_slow)
    trend = np.sign(c - s) * 0.5 + np.sign(f - s) * 0.5           # price & averages lined up
    slope = np.sign(s.diff(24))                                     # slow average rising?
    buy_ratio = (df["taker_buy_base"].rolling(v.flow_window).sum()
                 / df["volume"].rolling(v.flow_window).sum())        # who is hitting the buy button
    flow = np.clip((buy_ratio - 0.5) * 20, -1, 1)
    lb = max(168 // v.bar_hours, 42)
    rel = (c.pct_change(lb) - btc["close"].reindex(c.index).pct_change(lb))   # strength vs Bitcoin, 7 days
    rel_s = np.sign(rel).fillna(0)
    score = (0.35 * trend + 0.2 * slope + 0.25 * flow + 0.2 * rel_s).fillna(0)
    bc = btc["close"].reindex(c.index)
    tide = np.sign(bc - ema(bc, 200)).fillna(0)                     # is the whole crypto market up or down
    btc_ret = bc.pct_change(max(24 // v.bar_hours, 1))              # Bitcoin's last-24h move (crash detector)
    return pd.DataFrame({"atlas_score": score, "btc_ret": btc_ret, "flow": flow, "rel": rel, "tide": tide,
                         "trend": trend, "slope": slope})


# ---------- Agent 2: Hawk, the Sniper ----------

def hawk(df, v: Version):
    """Marks hours with a precise trigger. +1 = buy trigger, -1 = sell trigger."""
    c, h, l = df["close"], df["high"], df["low"]
    r = rsi(c)
    a = atr(df)
    vz = zscore(np.log1p(df["quote_volume"]), 168)
    ret_z = zscore(c.pct_change(), 168)
    sig = pd.Series(0, index=df.index, dtype=int)
    if "pullback" in v.setups:      # price dipped, then buyers stepped back in
        dipped = r.shift(1).rolling(6).min() < v.rsi_dip
        long_pb = dipped & (r > v.rsi_dip + 5) & (c > c.shift(1))
        popped = r.shift(1).rolling(6).max() > 100 - v.rsi_dip
        short_pb = popped & (r < 95 - v.rsi_dip) & (c < c.shift(1))
        sig[long_pb] = 1
        sig[short_pb & (sig == 0)] = -1
    if "breakout" in v.setups:      # new high on a burst of volume
        hi = h.shift(1).rolling(v.breakout_hours).max()
        lo = l.shift(1).rolling(v.breakout_hours).min()
        sig[(c > hi) & (vz > v.vol_z) & (sig == 0)] = 1
        sig[(c < lo) & (vz > v.vol_z) & (sig == 0)] = -1
    if "hold" in v.setups:          # trend, dip to the 20-bar average, close back on the trend side
        e20, e50 = ema(c, 20), ema(c, 50)
        up = (c > e50) & (e20 > e50)
        dn = (c < e50) & (e20 < e50)
        touch_up = (l <= e20 + 0.3 * a).rolling(2).max().astype(bool)
        touch_dn = (h >= e20 - 0.3 * a).rolling(2).max().astype(bool)
        mid = (r >= 38) & (r <= 62)
        sig[up & touch_up & (c > e20) & mid & (sig == 0)] = 1
        sig[dn & touch_dn & (c < e20) & mid & (sig == 0)] = -1
    if "shock" in v.setups:         # sudden jump with huge volume (the kind a big tweet causes)
        sig[(ret_z > 3) & (vz > v.vol_z + 1) & (sig == 0)] = 1
        sig[(ret_z < -3) & (vz > v.vol_z + 1) & (sig == 0)] = -1
    return pd.DataFrame({"hawk_sig": sig, "rsi": r, "atr": a, "vol_z": vz, "ret_z": ret_z})


# ---------- Agent 3: Sage, the Professor ----------

FEATURES = ["atlas_score", "flow", "rel", "tide", "rsi", "vol_z", "ret_z", "stretch", "vol_pct", "dir"]


class Sage:
    """Learns from past trade ideas how often each kind of setup actually won.

    It is a simple statistics model (logistic regression) trained only on the older
    "school" period, then judged on newer data it has never seen.
    """

    def __init__(self, v: Version):
        self.v = v
        self.w = None

    @staticmethod
    def _x(rows):
        x = rows[FEATURES].astype(float).copy()
        x["rel"] = x["rel"].clip(-0.5, 0.5) * 4
        x["rsi"] = (x["rsi"] - 50) / 25
        x["vol_z"] = x["vol_z"].clip(-4, 4) / 2
        x["ret_z"] = x["ret_z"].clip(-6, 6) / 3
        x["stretch"] = x["stretch"].clip(-8, 8) / 4
        x["vol_pct"] = x["vol_pct"] * 2 - 1
        sgn = x["dir"]
        for k in ["atlas_score", "flow", "rel", "tide", "rsi", "ret_z", "stretch"]:
            x[k] = x[k] * sgn                                       # read every feature "in the trade's favour"
        x = x.drop(columns="dir")
        x["bias"] = 1.0
        return np.nan_to_num(x.values)

    def fit(self, rows, won, l2=1.0, iters=3000, lr=0.1):
        X, y = self._x(rows), np.asarray(won, dtype=float)
        if self.v.sage_kind in ("knn", "knn_ev"):
            self.X, self.y = X[:, :-1], y
            self.r = rows["pnl"].values.astype(float) if "pnl" in rows else y
            return self
        w = np.zeros(X.shape[1])
        w[-1] = np.log((y.mean() + 1e-3) / (1 - y.mean() + 1e-3))
        for _ in range(iters):
            p = 1 / (1 + np.exp(-X @ w))
            g = X.T @ (p - y) / len(y) + l2 * np.r_[w[:-1], 0] / len(y)
            w -= lr * g
        self.w = w
        return self

    def prob(self, rows):
        if self.v.sage_kind == "knn":
            Q = self._x(rows)[:, :-1]
            out = np.empty(len(Q))
            for s in range(0, len(Q), 100):
                d = ((Q[s:s + 100, None, :] - self.X[None, :, :]) ** 2).sum(-1)
                k = min(self.v.knn_k, self.X.shape[0])
                nn = np.argpartition(d, k - 1, axis=1)[:, :k]
                out[s:s + 100] = (self.y[nn].sum(1) + 1) / (k + 2)    # small pull toward 50% to stay humble
            return out
        return 1 / (1 + np.exp(-self._x(rows) @ self.w))

    def expected(self, rows):
        """Average after-fee result of the most similar past trades (the 'profit' version of Sage)."""
        Q = self._x(rows)[:, :-1]
        out = np.empty(len(Q))
        k = min(self.v.knn_k, self.X.shape[0])
        for s in range(0, len(Q), 100):
            d = ((Q[s:s + 100, None, :] - self.X[None, :, :]) ** 2).sum(-1)
            nn = np.argpartition(d, k - 1, axis=1)[:, :k]
            out[s:s + 100] = self.r[nn].mean(1) * k / (k + 10)      # shrink toward zero to stay humble
        return out

    def approve(self, rows):
        if self.v.sage_kind == "knn_ev":
            ok = self.expected(rows) >= self.v.extra.get("min_ev", 0.003)
        else:
            ok = self.prob(rows) >= self.v.min_prob
        return np.asarray(ok) & self.risk_ok(rows).values

    def risk_ok(self, rows):
        v = self.v
        ok = (rows["stretch"].abs() <= v.max_stretch_atr) & (rows["vol_pct"] <= v.max_vol_pct)
        if "crash_guard" in v.extra:                                    # stand aside while the market is falling hard
            ok &= (rows["btc_ret"] * rows["dir"]).fillna(0) > -v.extra["crash_guard"]
        return ok
