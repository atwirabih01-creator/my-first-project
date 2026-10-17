import re,base64,os,sys
d='/tmp/claude-0/zdist'
html=open(d+'/index.html').read()
m=re.search(r'<script src="(/_expo/[^"]+)" defer></script>',html)
js=open(d+m.group(1)).read()
# inline png assets referenced as /assets/...
def rep(mm):
    p=d+mm.group(0)
    if os.path.exists(p):
        return 'data:image/png;base64,'+base64.b64encode(open(p,'rb').read()).decode()
    return mm.group(0)
js=re.sub(r'/assets/[A-Za-z0-9_@./\-]+\.png',rep,js)
js=js.replace('</script','<\\/script')
html=html.replace(m.group(0),'')
html=html.replace('<link rel="icon" href="/favicon.ico"/>','')
html=html.replace('</body>','<script>(function(){if(location.protocol!==\'file:\')return;[\'pushState\',\'replaceState\'].forEach(function(k){var o=history[k];history[k]=function(){try{return o.apply(history,arguments)}catch(e){}}})})();</script><script>'+js+'</script>\n</body>')
open(sys.argv[1],'w').write(html)
print(len(html))
