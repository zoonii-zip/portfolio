"""Freeze the current static site and its local assets for a weekly release."""
from pathlib import Path
import argparse, re, shutil, subprocess
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--refresh',action='store_true',help='Update Week 2 only when explicitly requested by the site owner.')
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
prefix='/weeks/week-2/'
dest=root/'weeks/week-2'
if dest.exists() and not args.refresh: raise SystemExit('Snapshot already exists; use --refresh only for an explicitly requested Week 2 update.')
files=subprocess.check_output(['git','ls-files'],cwd=root,text=True).splitlines()
for name in files:
 p=Path(name)
 if p.parts[0] in ('weeks','.github','tests','supabase') or name.startswith('.') or p.suffix not in ('.html','.js','.css','.png','.jpg','.jpeg','.webp','.svg','.gif','.ico','.mp4','.woff','.woff2','.json'): continue
 if p.parts[0]=='scripts' and (len(p.parts)<2 or p.parts[1]!='runtime'): continue
 if name in ('week-navigation.js','week-navigation.css'): continue
 target=dest/p;target.parent.mkdir(parents=True,exist_ok=True)
 if p.suffix in ('.html','.js','.css'):
  text=(root/p).read_text()
  # Prefix site-local absolute URLs, including route-map keys and CSS URLs.
  text=re.sub(r'''(["'`])/(?!/)''',lambda m:m[1]+prefix,text)
  text=text.replace('url(/', 'url('+prefix)
  if p.suffix=='.html':
   text=text.replace('data-week="working"','data-week="2"')
   text=re.sub(r'src="(?:'+re.escape(prefix)+r')?week-navigation.js[^"]*"','src="/week-navigation.js"',text)
   text=text.replace('content="index,follow,max-image-preview:large"','content="noindex,follow"')
  if name=='seo.js':
   text=text.replace("const path=()=>", "const path=()=>location.pathname==='/weeks/week-2.html'?'"+prefix+"':")
  target.write_text(text)
 else: shutil.copy2(root/p,target)
# Preserve the same entry convention as Week 1, with snapshot-relative assets.
(root/'weeks/week-2.html').write_text((dest/'index.html').read_text())
