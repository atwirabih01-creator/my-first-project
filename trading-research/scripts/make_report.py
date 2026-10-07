import pandas as pd, html
R="/tmp/claude-0/-home-user-my-first-project/30bf7354-333f-50b1-a5f2-f3e6397d8dfa/scratchpad/results"
W=pd.read_csv(f"{R}/gold_weekly_full.csv",index_col=0,parse_dates=True)

# weekly bar chart (SVG, one scale)
w,h,pad_l,pad_b,pad_t=900,260,44,28,14
n=len(W); bw=(w-pad_l-10)/n; lo,hi=-3,3.5
y=lambda v: pad_t+(hi-v)/(hi-lo)*(h-pad_t-pad_b)
bars=[]
for i,(d,r) in enumerate(W.iterrows()):
    v=r.pnl; x=pad_l+i*bw+1
    cls="pos" if v>0 else ("neg" if v<0 else "zero")
    top,bot=(y(v),y(0)) if v>=0 else (y(0),y(v))
    hh=max(bot-top,1.5)
    bars.append(f'<rect class="{cls}" x="{x:.1f}" y="{top:.1f}" width="{bw-2:.1f}" height="{hh:.1f}"><title>Week of {d:%d %b %Y}: {v:+.2f}% ({int(r.trades)} trades)</title></rect>')
grid="".join(f'<line class="grid" x1="{pad_l}" x2="{w-6}" y1="{y(t):.1f}" y2="{y(t):.1f}"/><text class="ax" x="{pad_l-6}" y="{y(t)+4:.1f}" text-anchor="end">{t:+d}%</text>' for t in [-3,-2,-1,0,1,2,3])
months="".join(f'<text class="ax" x="{pad_l+i*bw:.1f}" y="{h-8}">{d:%b %y}</text>' for i,d in enumerate(W.index) if i%4==0)
chart=f'<svg viewBox="0 0 {w} {h}" role="img" aria-label="Weekly profit and loss of the gold strategy at 1% risk, Oct 2025 to Oct 2026">{grid}<line class="zero-line" x1="{pad_l}" x2="{w-6}" y1="{y(0):.1f}" y2="{y(0):.1f}"/>{"".join(bars)}{months}</svg>'

rows="".join(f'<tr><td>{d:%d %b %Y}</td><td class="num">{int(r.trades)}</td><td class="num {"g" if r.pnl>0 else ("r" if r.pnl<0 else "")}">{r.pnl:+.2f}%</td><td class="num">{int(r.green)}</td></tr>' for d,r in W.iterrows())

page=open(f"{R}/../scripts/report_template.html").read().replace("{{CHART}}",chart).replace("{{WEEKROWS}}",rows)
open("/home/user/my-first-project/trading-research/report.html","w").write(page)
print("ok",len(page))
