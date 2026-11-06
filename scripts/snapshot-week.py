"""Freeze the current static site and its local assets for a weekly release."""
from pathlib import Path
import argparse, re, shutil, subprocess
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--week',type=int,default=2,help='Week number to freeze.')
parser.add_argument('--refresh',action='store_true',help='Replace an existing snapshot only when explicitly requested.')
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
if args.week < 1: raise SystemExit('Week must be positive.')
prefix=f'/weeks/week-{args.week}/'
dest=root/f'weeks/week-{args.week}'
if dest.exists() and not args.refresh: raise SystemExit('Snapshot already exists; use --refresh only for an explicitly requested update.')
files=subprocess.check_output(['git','ls-files'],cwd=root,text=True).splitlines()
for name in files:
 p=Path(name)
 if p.parts[0] in ('weeks','.github','tests') or name.startswith('.') or p.suffix not in ('.html','.js','.mjs','.css','.png','.jpg','.jpeg','.webp','.svg','.gif','.ico','.mp4','.woff','.woff2','.ttf','.otf','.json'): continue
 if p.parts[0]=='supabase' and name!='supabase/functions/_shared/cart-model.mjs': continue
 if p.parts[0]=='scripts' and p.suffix not in ('.js','.mjs'): continue
 if name in ('week-navigation.js','week-navigation.css'): continue
 target=dest/p;target.parent.mkdir(parents=True,exist_ok=True)
 if p.suffix in ('.html','.js','.mjs','.css'):
  text=(root/p).read_text()
  # Prefix site-local absolute URLs, including route-map keys and CSS URLs.
  text=re.sub(r'''(["'`])/(?!/|>)''',lambda m:m[1]+prefix,text)
  text=text.replace('url(/', 'url('+prefix)
  if p.suffix=='.html':
   text=text.replace('data-week="working"',f'data-week="{args.week}"')
   text=re.sub(r'src="(?:'+re.escape(prefix)+r')?week-navigation.js[^"]*"','src="/week-navigation.js"',text)
   text=text.replace('content="index,follow,max-image-preview:large"','content="noindex,follow"')
  if name=='seo.js':
   text=text.replace("const path=()=>", f"const path=()=>location.pathname==='/weeks/week-{args.week}.html'?'{prefix}':")
  target.write_text(text)
 else: shutil.copy2(root/p,target)
# Preserve the same entry convention as Week 1, with snapshot-relative assets.
(root/f'weeks/week-{args.week}.html').write_text((dest/'index.html').read_text())
