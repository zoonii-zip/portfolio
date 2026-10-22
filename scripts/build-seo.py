#!/usr/bin/env python3
"""Rebuild static entry points from the current index.html; no third-party packages."""
from pathlib import Path
import re, json, html
from asset_versions import version_html
ROOT = Path(__file__).resolve().parents[1]
esc = lambda x: html.escape(str(x), quote=True)
def js(x): return json.dumps(x, ensure_ascii=False).replace('<', '\\u003c')
source = (ROOT/'index.html').read_text()
original = source
# Only generated blocks are replaced. The interactive page remains the source of truth.
for name in ['HEAD', 'CONTENT']:
 source = re.sub(r'<!-- SEO:'+name+r':START -->.*?<!-- SEO:'+name+r':END -->', '', source, flags=re.S)
source = re.sub(r'<title>.*?</title>', '', source, count=1, flags=re.S)
# Runtime code is shared and cached; read it only to extract the source data.
runtime_sources = [ROOT / path.lstrip('/') for path in re.findall(r'<script[^>]+src="(/scripts/runtime/[^"?]+)', source)]
data_source = source + '\n' + '\n'.join(path.read_text() for path in runtime_sources)
projects = json.loads(re.search(r'const projects=(.*?);\n', data_source).group(1))
records = json.loads(re.search(r'const careerRecords=(.*?);', data_source).group(1))
extras = json.loads(re.search(r'const careerExtras=(.*?);\n', data_source).group(1))
origin = 'https://' + (ROOT/'CNAME').read_text().strip()
person = {'@type':'Person','@id':origin+'/profile/#person','name':'김주연','alternateName':'Zoonii','url':origin+'/profile/','jobTitle':'Designer · Illustrator · Educator','description':'UI/UX · 웹·앱 디자인, 일러스트레이션, 브랜딩과 편집 디자인을 작업하고 디자인 교육을 진행하는 김주연 / Zoonii.','sameAs':['https://www.instagram.com/thingthingclub/'],'knowsAbout':['UI/UX Design','Illustration','Brand Design','Design Education']}
labels={'STORY':('illustration','일러스트레이션'),'PRODUCT':('uiux','UI/UX · 웹 · 앱 디자인'),'VISUAL':('branding','브랜딩 · 편집 디자인')}
pages={}
def add(path,title,desc,content,action='home',index=True,mode=None,work=None):
 graph=[person,{'@type':'WebSite','@id':origin+'/#website','name':'ZOONII.ZIP','url':origin+'/'},{'@type':'WebPage','@id':origin+path+'#webpage','url':origin+path,'name':title,'description':desc,'inLanguage':'ko','isPartOf':{'@id':origin+'/#website'},'about':{'@id':person['@id']}}]
 if work: graph.append(work)
 pages[path]={'title':title,'description':desc,'content':content,'action':action,'index':index,'mode':mode,'schema':{'@context':'https://schema.org','@graph':graph}}
nav='<nav aria-label="포트폴리오 페이지">'+''.join(f'<a href="{p}">{t}</a> ' for p,t in [('/','Home'),('/profile/','Profile'),('/archive/','Archive'),('/career/','Career')])+'</nav>'
intro='김주연 / Zoonii의 UI/UX 디자인, 일러스트레이션, 브랜딩과 교육 작업을 소개하는 포트폴리오입니다.'
add('/','Zoonii — 김주연 | 디자이너 · 일러스트레이터',intro,'<h1>김주연 / Zoonii</h1><p>Designer · Illustrator · Educator</p><p>'+intro+'</p>'+nav)
add('/profile/','Profile — 김주연 / Zoonii', '아이디어를 화면과 이미지로 만드는 디자이너 김주연 / Zoonii의 소개와 작업 분야.', '<h1>김주연 / Zoonii</h1><p>Designer · Illustrator · Educator</p><p>UI/UX · 웹·앱 디자인, 일러스트레이션, 브랜딩과 편집 디자인을 작업하고 디자인 교육을 진행합니다.</p><h2>내가 꿈꾸는 것, 당신이 꿈꾸는 것을 만듭니다.</h2><p>아직 말로만 존재하는 아이디어를 함께 구체화하고, 보고 만지고 사용할 수 있는 모습으로 만듭니다.</p><p><a href="https://www.instagram.com/thingthingclub/" target="_blank" rel="noopener noreferrer">Instagram · @thingthingclub ↗</a></p>'+nav,'about')
# The interactive profile and its readable page use the same background facts.
profile_source = ROOT/'profile-film.js'
if profile_source.exists():
 match = re.search(r'const profileFacts = (.*?);\n', profile_source.read_text())
 if match:
  facts = json.loads(match[1])
  for section in facts.values():
   items=''.join('<li>'+('<small>'+esc(item[2])+'</small> · ' if len(item)>2 else '')+'<strong>'+esc(item[0])+'</strong><p>'+esc(item[1])+'</p></li>' for item in section['items'])
   pages['/profile/']['content']+='<section><h2>'+esc(section['title'])+'</h2><ul>'+items+'</ul></section>'
def listing(mode=None):
 return '<ul>'+''.join(f'<li><a href="/projects/{esc(k)}/">{esc(p["name"])}</a> — {esc(p["role"])} · {esc(p["period"])}</li>' for k,p in projects.items() if mode is None or p['mode']==mode)+'</ul>'
category_nav='<nav aria-label="작업 분야">'+''.join(f'<a href="/archive/{slug}/">{label}</a> ' for slug,label in labels.values())+'</nav>'
add('/archive/','Archive — Zoonii의 디자인 · 일러스트레이션 작업','Zoonii의 일러스트레이션, UI/UX, 브랜딩과 편집 디자인 프로젝트 목록. 작품 이미지와 상세 설명은 준비 중입니다.','<h1>Zoonii Archive</h1>'+category_nav+listing()+'<p>프로젝트 이미지 · 상세 준비 중</p>','files')
for mode,(slug,label) in labels.items():
 add('/archive/'+slug+'/',label+' — Zoonii',f'김주연 / Zoonii의 {label} 프로젝트 목록과 작업 역할.','<h1>'+label+'</h1>'+category_nav+listing(mode)+'<p>프로젝트 이미지 · 상세 준비 중</p>','files',mode=mode)
rows=''.join('<tr>'+''.join('<td>'+esc(r[i])+'</td>' for i in [0,2,3,5])+'</tr>' for r in records if r[4] not in ['teaching','exhibition'])
career_extras = re.sub(r'<h2>[^<]*(?:학력|수상·자격)[^<]*</h2>.*?(?=<h2>|$)', '', extras, flags=re.S)
add('/career/','Career — 김주연 / Zoonii의 작업 이력','김주연 / Zoonii의 UI/UX, 일러스트레이션, 브랜딩 프로젝트와 디자인 교육 이력.','<h1>김주연 / Zoonii의 작업 이력</h1><table><thead><tr><th>기간</th><th>프로젝트 / 회사</th><th>역할</th><th>분야</th></tr></thead><tbody>'+rows+'</tbody></table>'+career_extras,'career')
for path,title,desc,action in [('/contact/','Contact','프로젝트와 협업, 강의 이야기를 들려주세요. 문의 양식으로 메시지를 보내거나 illu_junny@naver.com으로 연락해주세요.','contact'),('/guestbook/','Guestbook','메모 보드는 준비 중이에요.','guest'),('/thingthingclub/','ThingThingClub','감정을 판매하는 식료품점. 그림에서 제품으로, 전시에서 일상으로. 상품 이미지와 판매 링크는 준비 중입니다.','club')]:
 add(path,title+' — Zoonii',desc,'<h1>'+title+'</h1><p>'+desc+'</p>'+nav,action,index=False)
# Reusable detail layouts: replace project copy and media without changing structure.
case_templates = {
 'PRODUCT': {'label':'WEB / APP', 'intro':'사용자의 다음 행동이 자연스럽게 이어지는 화면을 만듭니다.', 'sections':[
  ('01','Overview','프로젝트의 시작','서비스의 핵심 정보를 쉽게 이해하고 필요한 기능에 빠르게 도달하도록 정보 구조와 화면의 우선순위를 정리합니다.',['기존 화면 · 리서치 자료|16 / 10','정보 구조 · 사용자 흐름|16 / 10']),
  ('02','Experience','흐름을 먼저, 화면은 그다음','진입부터 탐색, 핵심 행동까지의 여정을 연결합니다. 반복되는 요소는 일관된 규칙으로 정리하고 중요한 정보가 먼저 보이도록 설계합니다.',['주요 화면 01 · 진입|16 / 10','주요 화면 02 · 탐색|16 / 10']),
  ('03','Interface','작은 화면에서도 같은 경험','다양한 화면 크기에서 읽기와 조작이 편하도록 레이아웃, 글자 크기, 버튼의 배치를 조정합니다.',['모바일 화면 01|9 / 16','모바일 화면 02|9 / 16','모바일 화면 03|9 / 16']),
  ('04','Design system','일관성을 만드는 규칙','컬러, 타이포그래피, 컴포넌트를 정리해 서비스 전반에 같은 시각 언어를 적용합니다.',['UI 컴포넌트 · 디자인 시스템|16 / 9'])]},
 'STORY': {'label':'ILLUSTRATION','intro':'하나의 이야기에서 출발해, 오래 기억되는 장면으로.', 'sections':[
  ('01','Concept','그림이 시작되는 이야기','프로젝트가 전하고 싶은 분위기와 메시지를 키워드로 정리합니다. 친근한 형태와 리듬감 있는 구성을 중심으로 그림의 방향을 잡습니다.',['무드보드 · 콘셉트 스케치|4 / 3','러프 · 컬러 스터디|4 / 3']),
  ('02','Artwork','하나의 세계, 여러 개의 장면','공통된 색과 형태를 유지하면서 장면마다 다른 이야기를 담습니다. 각 이미지는 단독으로도, 시리즈로도 이어질 수 있도록 구성합니다.',['완성 작품 01|4 / 5','완성 작품 02|4 / 5']),
  ('03','Details','가까이 들여다보기','작은 표정과 질감, 화면 곳곳의 디테일이 전체 분위기를 완성합니다. 그림의 개성이 드러나는 부분을 확대해 보여줍니다.',['디테일 01|1 / 1','디테일 02|1 / 1','디테일 03|1 / 1']),
  ('04','In context','그림이 일상에 닿는 방식','완성된 그림이 제품과 인쇄물, 디지털 매체에 적용되는 모습을 소개합니다.',['제품 · 캠페인 적용 목업|16 / 9'])]},
 'VISUAL': {'label':'BRAND / EDITORIAL','intro':'브랜드의 생각을, 일관된 시각 언어로 정리합니다.', 'sections':[
  ('01','Direction','브랜드를 읽는 첫인상','브랜드의 가치와 전달할 메시지를 정리하고, 이를 담아낼 시각적 방향을 설정합니다. 명료한 구조와 균형 있는 여백을 바탕으로 첫인상을 설계합니다.',['브랜드 키워드 · 무드보드|16 / 10']),
  ('02','Visual identity','하나의 인상을 만드는 요소들','로고, 색상, 타이포그래피가 함께 작동하도록 기본 규칙을 정리합니다. 매체가 달라져도 같은 브랜드로 느껴지도록 연결합니다.',['로고 · 그래픽 시스템|1 / 1','컬러 · 타이포그래피|1 / 1']),
  ('03','Editorial','정보에 리듬을 더하는 편집','정보의 위계와 읽는 순서를 바탕으로 그리드를 구성합니다. 이미지와 텍스트의 밀도를 조절해 펼침면마다 자연스러운 호흡을 만듭니다.',['표지 · 패키지 전개|4 / 3','내지 펼침면 01|4 / 3','내지 펼침면 02|4 / 3']),
  ('04','Applications','여러 매체로 이어지는 브랜드','인쇄물과 패키지, 디지털 접점에 디자인 시스템을 적용한 모습을 소개합니다.',['인쇄물 · 브랜드 적용 목업|16 / 9'])]}
}
def case_box(spec, index):
 label,ratio=spec.split('|')
 return f'<figure class="case-media" style="--media-ratio:{ratio}"><span class="case-media-index">{index}</span><div><span class="case-media-cross" aria-hidden="true">+</span><figcaption>{esc(label)}</figcaption><small>IMAGE PLACEHOLDER · {ratio.replace(" / ", ":")}</small></div></figure>'
def case_content(p):
 template=case_templates[p['mode']]
 slug,label=labels[p['mode']]
 sections=''
 for number,en,title,copy,media in template['sections']:
  grid=''.join(case_box(item,f'{number}.{i+1}') for i,item in enumerate(media))
  sections+=f'<section class="case-section"><div class="case-section-heading"><span>{number} / {en}</span><h2>{title}</h2><p>{copy}</p></div><div class="case-grid case-grid-{len(media)}">{grid}</div></section>'
 return f'''<article class="project-case case-{p['mode'].lower()}">
 <header class="case-header"><div class="case-eyebrow"><a href="/archive/{slug}/">← Archive</a><span>{template['label']} / SELECTED WORK</span></div><h1>{esc(p['name'])}</h1><p class="case-summary">{esc(p.get('description',p['role']))}</p><dl class="case-meta"><div><dt>CATEGORY</dt><dd>{label}</dd></div><div><dt>SCOPE</dt><dd>{esc(p['role'])}</dd></div><div><dt>PERIOD</dt><dd>{esc(p['period'])}</dd></div><div><dt>DESIGNER</dt><dd>김주연 / Zoonii</dd></div></dl></header>
 {case_box('대표 이미지 · 프로젝트 키비주얼|16 / 9','COVER')}
 <div class="case-intro"><span>ABOUT THE PROJECT</span><h2>{template['intro']}</h2><p class="case-draft">LAYOUT PREVIEW · 아래 설명은 구성을 확인하기 위한 샘플입니다. 실제 프로젝트 내용과 이미지로 교체할 예정입니다.</p></div>
 {sections}<footer class="case-footer"><span>THANK YOU FOR WATCHING</span><a href="/archive/{slug}/">← Back to {template['label']}</a><small>김주연 / Zoonii</small></footer></article>'''

for key,p in projects.items():
 path='/projects/'+key+'/'
 desc=p['name']+' — '+p.get('description',p['role'])+'. Zoonii의 '+labels[p['mode']][1]+' 프로젝트. 상세 준비 중입니다.'
 work={'@type':'CreativeWork','@id':origin+path+'#work','name':p['name'],'url':origin+path,'creator':{'@id':person['@id']},'description':p.get('description',p['role']),'genre':labels[p['mode']][1]}
 content=case_content(p)
 add(path,p['name']+' — Zoonii',desc,content,'project',index=False,mode=p['mode'],work=work)
# Hooks notify only after the existing UI actually changes, including keyboard navigation.
if '/* SEO bridge */' not in data_source:
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
 return '<!-- SEO:HEAD:START -->\n<base href="/">\n<title>'+esc(page['title'])+'</title>\n'+''.join(f'<meta {a}="{b}" content="{esc(c)}">\n' for a,b,c in values)+f'<link rel="canonical" href="{url}">\n<link rel="stylesheet" href="/seo.css">\n<script id="zz-structured-data" type="application/ld+json">{js(page["schema"])}</script>\n<script src="/seo-pages.js"></script><script src="/seo.js?v=clock-size-11"></script>\n<!-- SEO:HEAD:END -->'
for path,page in pages.items():
 content='<!-- SEO:CONTENT:START --><main id="zz-readable" tabindex="-1">'+page['content']+'</main><!-- SEO:CONTENT:END -->'
 output=source.replace('</head>',head(path,page)+'</head>',1).replace('<body>','<body>'+content,1)
 dest=ROOT/(path.strip('/')+'/index.html' if path!='/' else 'index.html')
 dest.parent.mkdir(parents=True,exist_ok=True)
 if path=='/' and (ROOT/'index.html').read_text()!=original: raise RuntimeError('index.html changed during build. Retry to preserve concurrent edits.')
 dest.write_text(version_html(output, ROOT))
(ROOT/'seo-pages.js').write_text('/* Generated by scripts/build-seo.py. */\nwindow.ZooniiSEOPages = '+js(pages)+';\n')
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('<url><loc>'+origin+path+'</loc></url>\n' for path,p in pages.items() if p['index'])+'</urlset>\n')
(ROOT/'robots.txt').write_text('User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nSitemap: '+origin+'/sitemap.xml\n')
print(f'Generated {len(pages)} pages; {sum(p["index"] for p in pages.values())} indexable. Pending detail pages remain noindex.')
