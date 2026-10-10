#!/usr/bin/env python3
"""Rebuild static entry points from the current index.html; no third-party packages."""
from pathlib import Path
import re, json, html
ROOT = Path(__file__).resolve().parents[1]
esc = lambda x: html.escape(str(x), quote=True)
def js(x): return json.dumps(x, ensure_ascii=False).replace('<', '\\u003c')
source = (ROOT/'index.html').read_text()
original = source
# Only generated blocks are replaced. The interactive page remains the source of truth.
for name in ['HEAD', 'CONTENT']:
 source = re.sub(r'<!-- SEO:'+name+r':START -->.*?<!-- SEO:'+name+r':END -->', '', source, flags=re.S)
source = re.sub(r'<title>.*?</title>', '', source, count=1, flags=re.S)
projects = json.loads(re.search(r'const projects=(.*?);\n', source).group(1))
records = json.loads(re.search(r'const careerRecords=(.*?);', source).group(1))
extras = json.loads(re.search(r'const careerExtras=(.*?);\n', source).group(1))
origin = 'https://' + (ROOT/'CNAME').read_text().strip()
person = {'@type':'Person','@id':origin+'/profile/#person','name':'김주연','alternateName':'Zoonii','url':origin+'/profile/','jobTitle':'Designer · Illustrator · Educator','knowsAbout':['UI/UX Design','Illustration','Brand Design','Design Education']}
labels={'STORY':('illustration','일러스트레이션'),'PRODUCT':('uiux','UI/UX · 웹 · 앱 디자인'),'VISUAL':('branding','브랜딩 · 편집 디자인')}
pages={}
def add(path,title,desc,content,action='home',index=True,mode=None,work=None):
 graph=[person,{'@type':'WebSite','@id':origin+'/#website','name':'ZOONII.ZIP','url':origin+'/'},{'@type':'WebPage','@id':origin+path+'#webpage','url':origin+path,'name':title,'description':desc,'inLanguage':'ko','isPartOf':{'@id':origin+'/#website'},'about':{'@id':person['@id']}}]
 if work: graph.append(work)
 pages[path]={'title':title,'description':desc,'content':content,'action':action,'index':index,'mode':mode,'schema':{'@context':'https://schema.org','@graph':graph}}
nav='<nav aria-label="포트폴리오 페이지">'+''.join(f'<a href="{p}">{t}</a> ' for p,t in [('/','Home'),('/profile/','Profile'),('/archive/','Archive'),('/career/','Career')])+'</nav>'
intro='김주연 / Zoonii의 UI/UX 디자인, 일러스트레이션, 브랜딩과 교육 작업을 소개하는 포트폴리오입니다.'
add('/','Zoonii — 김주연 | 디자이너 · 일러스트레이터',intro,'<h1>김주연 / Zoonii</h1><p>Designer · Illustrator · Educator</p><p>'+intro+'</p>'+nav)
add('/profile/','Profile — 김주연 / Zoonii', '아이디어를 화면과 이미지로 만드는 디자이너 김주연 / Zoonii의 소개와 작업 분야.', '<h1>김주연 / Zoonii</h1><p>Designer · Illustrator · Educator</p><h2>내가 꿈꾸는 것, 당신이 꿈꾸는 것을 만듭니다.</h2><p>아직 말로만 존재하는 아이디어를 함께 구체화하고, 보고 만지고 사용할 수 있는 모습으로 만듭니다.</p><img src="/assets/profile-collage-child-restored.png" width="1536" height="1024" alt="하늘색 zoonii 로고, 데님 모자, 어린 시절 사진으로 만든 김주연의 프로필 콜라주">'+nav,'about')
def listing(mode=None):
 return '<ul>'+''.join(f'<li><a href="/projects/{esc(k)}/">{esc(p["name"])}</a> — {esc(p["role"])} · {esc(p["period"])}</li>' for k,p in projects.items() if mode is None or p['mode']==mode)+'</ul>'
category_nav='<nav aria-label="작업 분야">'+''.join(f'<a href="/archive/{slug}/">{label}</a> ' for slug,label in labels.values())+'</nav>'
add('/archive/','Archive — Zoonii의 디자인 · 일러스트레이션 작업','Zoonii의 일러스트레이션, UI/UX, 브랜딩과 편집 디자인 프로젝트 목록. 작품 이미지와 상세 설명은 준비 중입니다.','<h1>Zoonii Archive</h1>'+category_nav+listing()+'<p>프로젝트 이미지 · 상세 준비 중</p>','files')
for mode,(slug,label) in labels.items():
 add('/archive/'+slug+'/',label+' — Zoonii',f'김주연 / Zoonii의 {label} 프로젝트 목록과 작업 역할.','<h1>'+label+'</h1>'+category_nav+listing(mode)+'<p>프로젝트 이미지 · 상세 준비 중</p>','files',mode=mode)
rows=''.join('<tr>'+''.join('<td>'+esc(r[i])+'</td>' for i in [0,2,3,5])+'</tr>' for r in records if r[4] not in ['teaching','exhibition'])
add('/career/','Career — 김주연 / Zoonii의 작업 이력','김주연 / Zoonii의 UI/UX, 일러스트레이션, 브랜딩 프로젝트와 디자인 교육 이력.','<h1>김주연 / Zoonii의 작업 이력</h1><table><thead><tr><th>기간</th><th>프로젝트 / 회사</th><th>역할</th><th>분야</th></tr></thead><tbody>'+rows+'</tbody></table>'+extras,'career')
for path,title,desc,action in [('/contact/','Contact','프로젝트와 협업, 강의 이야기를 들려주세요. 현재 문의 양식은 전송되지 않는 미리보기입니다.','contact'),('/guestbook/','Guestbook','메모 보드는 준비 중이에요.','guest'),('/thingthingclub/','ThingThingClub','감정을 판매하는 식료품점. 그림에서 제품으로, 전시에서 일상으로. 상품 이미지와 판매 링크는 준비 중입니다.','club')]:
 add(path,title+' — Zoonii',desc,'<h1>'+title+'</h1><p>'+desc+'</p>'+nav,action,index=False)
for key,p in projects.items():
 path='/projects/'+key+'/'
 desc=p['name']+' — '+p['role']+'. Zoonii의 '+labels[p['mode']][1]+' 프로젝트. 상세 준비 중입니다.'
 work={'@type':'CreativeWork','@id':origin+path+'#work','name':p['name'],'url':origin+path,'creator':{'@id':person['@id']},'description':p['role'],'genre':labels[p['mode']][1]}
 content=f'<article><h1>{esc(p["name"])}</h1><p>김주연 / Zoonii</p><dl><dt>분야</dt><dd>{labels[p["mode"]][1]}</dd><dt>작업</dt><dd>{esc(p["role"])}</dd><dt>기간</dt><dd>{esc(p["period"])}</dd></dl><p>프로젝트 이미지 · 상세 준비 중</p><a href="/archive/{labels[p["mode"]][0]}/">← Archive</a></article>'
 add(path,p['name']+' — Zoonii',desc,content,'project',index=False,work=work)
# Hooks notify only after the existing UI actually changes, including keyboard navigation.
if '/* SEO bridge */' not in source:
 needle="function open(title,html){"
 source=source.replace(needle,needle+"window.ZooniiSEO?.opened(title);",1)
 source=source.replace("selectDock('home');if(typeof after", "selectDock('home');window.ZooniiSEO?.publish('/');if(typeof after",1)
 source=source.replace("q('[data-action=\"close\"]').textContent='← Back to Home';\n }", "q('[data-action=\"close\"]').textContent='← Back to Home';window.ZooniiSEO?.archive(archiveMode);\n }",1)
 end=" })();\n </script>"
 bridge='''
 /* SEO bridge */
 window.ZooniiSEOView = function(page){
  // History restoration must also work during a running camera transition.
  if(moveTimer)clearTimeout(moveTimer);moving=false;root.classList.remove('travelling');clearCameraClone();
  current=null;activeFolder=null;
  if(page.action==='home'){close();return;}
  if(page.action==='project'){travel('files',()=>open(page.title,page.content));selectDock('files');return;}
  if(page.action==='files'){travel('files',()=>folderNow(page.mode||'STORY'));selectDock('files');return;}
  action(page.action);selectDock(page.action);
 };
'''
 assert end in source
 source=source.replace(end,bridge+end,1)

def head(path,page):
 url=origin+path
 values=[('name','description',page['description']),('name','robots','index,follow,max-image-preview:large' if page['index'] else 'noindex,follow'),('property','og:type','website'),('property','og:locale','ko_KR'),('property','og:site_name','ZOONII.ZIP'),('property','og:title',page['title']),('property','og:description',page['description']),('property','og:url',url),('property','og:image',origin+'/assets/intro-folder-logo.png'),('property','og:image:alt','Zoonii Zip 폴더 로고'),('name','twitter:card','summary_large_image'),('name','twitter:title',page['title']),('name','twitter:description',page['description']),('name','twitter:image',origin+'/assets/intro-folder-logo.png'),('name','twitter:image:alt','Zoonii Zip 폴더 로고')]
 return '<!-- SEO:HEAD:START -->\n<base href="/">\n<title>'+esc(page['title'])+'</title>\n'+''.join(f'<meta {a}="{b}" content="{esc(c)}">\n' for a,b,c in values)+f'<link rel="canonical" href="{url}">\n<link rel="stylesheet" href="/seo.css">\n<script id="zz-structured-data" type="application/ld+json">{js(page["schema"])}</script>\n<script src="/seo-pages.js"></script><script src="/seo.js"></script>\n<!-- SEO:HEAD:END -->'
for path,page in pages.items():
 content='<!-- SEO:CONTENT:START --><main id="zz-readable" tabindex="-1">'+page['content']+'</main><!-- SEO:CONTENT:END -->'
 output=source.replace('</head>',head(path,page)+'</head>',1).replace('<body>','<body>'+content,1)
 dest=ROOT/(path.strip('/')+'/index.html' if path!='/' else 'index.html')
 dest.parent.mkdir(parents=True,exist_ok=True)
 if path=='/' and (ROOT/'index.html').read_text()!=original: raise RuntimeError('index.html changed during build. Retry to preserve concurrent edits.')
 dest.write_text(output)
(ROOT/'seo-pages.js').write_text('/* Generated by scripts/build-seo.py. */\nwindow.ZooniiSEOPages = '+js(pages)+';\n')
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('<url><loc>'+origin+path+'</loc></url>\n' for path,p in pages.items() if p['index'])+'</urlset>\n')
(ROOT/'robots.txt').write_text('User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nSitemap: '+origin+'/sitemap.xml\n')
print(f'Generated {len(pages)} pages; {sum(p["index"] for p in pages.values())} indexable. Pending detail pages remain noindex.')
