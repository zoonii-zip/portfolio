#!/usr/bin/env python3
"""Validate generated routes, metadata, local links, JSON-LD and JavaScript syntax."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse
import json, subprocess, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self):
  super().__init__();self.scripts=[];self.script=None;self.meta={};self.canon=[];self.images=[];self.links=[];self.titles=0;self.main=False
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='script' and 'src' not in a:self.script=[a.get('type',''),'']
  if t=='meta':self.meta[a.get('name',a.get('property'))]=a.get('content')
  if t=='link' and a.get('rel')=='canonical':self.canon.append(a['href'])
  if t=='img':self.images.append(a)
  if t=='a' and a.get('href','').startswith('/'):self.links.append(a['href'])
  if t=='title':self.titles+=1
  if t=='main' and a.get('id')=='zz-readable':self.main=True
 def handle_data(self,d):
  if self.script is not None:self.script[1]+=d
 def handle_endtag(self,t):
  if t=='script' and self.script is not None:self.scripts.append(self.script);self.script=None
pages=json.loads((ROOT/'seo-pages.js').read_text().split(' = ',1)[1].rstrip(';\n'))
origin='https://'+(ROOT/'CNAME').read_text().strip()
for route,data in pages.items():
 file=ROOT/(route.strip('/')+'/index.html' if route!='/' else 'index.html');p=Page();p.feed(file.read_text())
 assert p.titles==1 and p.canon==[origin+route],route
 assert p.main and p.meta['description']==data['description'],route
 assert p.meta['og:url']==origin+route and p.meta['twitter:title']==data['title'],route
 assert ('noindex' not in p.meta['robots'])==data['index'],route
 for image in p.images:
  assert 'alt' in image,(route,image)
  if not urlparse(image.get('src','')).scheme:assert (ROOT/image['src'].lstrip('/')).exists(),image
 for link in p.links:assert urlparse(link).path in pages,link
 for kind,script in p.scripts:
  if kind=='application/ld+json':
   graph=json.loads(script);assert graph==data['schema']
  else:
   result=subprocess.run(['node','--check'],input=script,text=True,capture_output=True)
   assert result.returncode==0,(route,result.stderr)
for f in ['seo.js','seo-pages.js']:
 subprocess.run(['node','--check',str(ROOT/f)],check=True)
urls=[e.text for e in ET.parse(ROOT/'sitemap.xml').findall('.//{*}loc')]
assert set(urls)=={origin+route for route,data in pages.items() if data['index']}
assert 'User-agent: OAI-SearchBot\nAllow: /' in (ROOT/'robots.txt').read_text()
print(f'PASS: {len(pages)} routes, {len(urls)} sitemap entries, metadata, JSON-LD, links, image alt and JavaScript syntax.')
