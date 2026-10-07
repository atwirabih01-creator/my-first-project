import numpy as np, pandas as pd, lzma, glob, os
RAW = os.environ.get("RAW") or os.path.join(os.path.dirname(__file__), "..", "raw")
SYMS = {"GBPUSD":"GBPUSD","XAUUSD":"XAUUSD","NAS100":"USATECHIDXUSD","GBPJPY":"GBPJPY"}
SCALE = {"GBPUSD":1e5,"GBPJPY":1e3,"XAUUSD":1e3,"USATECHIDXUSD":1e3}
# realistic round-trip cost (spread + commission) in price units, prop-firm style accounts
COST = {"GBPUSD":0.00012,"GBPJPY":0.022,"XAUUSD":0.50,"NAS100":1.8}
# a "pip/point" for reporting
PIP = {"GBPUSD":0.0001,"GBPJPY":0.01,"XAUUSD":0.1,"NAS100":1.0}
DT = np.dtype([("t",">i4"),("o",">i4"),("c",">i4"),("l",">i4"),("h",">i4"),("v",">f4")])

def load(name):
    code = SYMS[name]; sc = SCALE[code]; parts=[]
    for f in sorted(glob.glob(f"{RAW}/{code}/*.bi5")):
        b = open(f,"rb").read()
        if not b: continue
        a = np.frombuffer(lzma.decompress(b), dtype=DT)
        day = pd.Timestamp(os.path.basename(f)[:10], tz="UTC")
        df = pd.DataFrame({"o":a["o"]/sc,"h":a["h"]/sc,"l":a["l"]/sc,"c":a["c"]/sc,"v":a["v"].astype(float)},
                          index=day+pd.to_timedelta(a["t"].astype(int),unit="s"))
        parts.append(df[df.v>0])
    df = pd.concat(parts).sort_index()
    df = df[~df.index.duplicated()]
    return df

def resample(df, tf):
    r = df.resample(tf, label="left", closed="left").agg({"o":"first","h":"max","l":"min","c":"last","v":"sum"})
    return r.dropna()

def us_dst(day):
    y=day.year; mar=pd.Timestamp(y,3,1,tz="UTC"); nov=pd.Timestamp(y,11,1,tz="UTC")
    start=mar+pd.Timedelta(days=(6-mar.weekday())%7+7); end=nov+pd.Timedelta(days=(6-nov.weekday())%7)
    return start<=day<end
