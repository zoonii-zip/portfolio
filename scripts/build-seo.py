#!/usr/bin/env python3
"""Rebuild static entry points from the current index.html; no third-party packages."""
from pathlib import Path
import re, json, html
from asset_versions import version_html
import project_cases
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
# Career is sourced only from the latest user-supplied resume. Keep this required:
# silently falling back to legacy runtime records would restore superseded facts.
career_source = (ROOT/'career-data.js').read_text()
career_match = re.search(r'window\.ZooniiCareerData\s*=\s*(\{.*\})\s*;\s*$', career_source, re.S)
if not career_match:
 raise ValueError('career-data.js must assign a JSON object to window.ZooniiCareerData')
career = json.loads(career_match[1])
origin = 'https://' + (ROOT/'CNAME').read_text().strip()
person = {'@type':'Person','@id':origin+'/profile/#person','name':'김주연','alternateName':'Zoonii','url':origin+'/profile/','jobTitle':'Illustrator · Experience Maker · Educator','description':'그림을 그리고, 경험을 설계하고, 아이디어를 실제의 모습으로 만드는 김주연 / Zoonii.','sameAs':['https://www.instagram.com/thingthingclub/'],'knowsAbout':['Illustration','UI/UX Design','Brand Design','Creative Coding','Design Education']}
labels={'STORY':('illustration','일러스트레이션'),'PRODUCT':('uiux','UI/UX · 웹 · 앱 디자인'),'VISUAL':('branding','브랜딩 · 편집 디자인')}
pages={}
def add(path,title,desc,content,action='home',index=True,mode=None,work=None):
 graph=[person,{'@type':'WebSite','@id':origin+'/#website','name':'ZOONII.ZIP','url':origin+'/'},{'@type':'WebPage','@id':origin+path+'#webpage','url':origin+path,'name':title,'description':desc,'inLanguage':'ko','isPartOf':{'@id':origin+'/#website'},'about':{'@id':person['@id']}}]
 if work: graph.append(work)
 pages[path]={'title':title,'description':desc,'content':content,'action':action,'index':index,'mode':mode,'schema':{'@context':'https://schema.org','@graph':graph}}
nav='<nav aria-label="포트폴리오 페이지">'+''.join(f'<a href="{p}">{t}</a> ' for p,t in [('/','Home'),('/profile/','Profile'),('/archive/','Archive'),('/career/','Career')])+'</nav>'
intro='그림을 그리고, 경험을 설계하고, 아이디어를 실제의 모습으로 만드는 김주연 / Zoonii의 포트폴리오입니다.'
add('/','Zoonii — 김주연 | Illustrator · Experience Maker',intro,'<h1>김주연 / Zoonii</h1><p>Illustrator · Experience Maker · Educator</p><p>'+intro+'</p>'+nav)
add('/profile/','Profile — 김주연 / Zoonii', '일러스트레이션과 UI/UX, 브랜딩과 구현을 연결해 아이디어를 실제의 모습으로 만드는 김주연 / Zoonii.', '<h1>김주연 / Zoonii</h1><p>Illustrator · Experience Maker · Educator</p><h2>그림을 그리고, 경험을 설계하고, 손으로 만드는 사람.</h2><p>일러스트레이션·UI/UX·브랜딩·구현을 나누지 않고, 하나의 아이디어가 사람에게 닿는 모습을 만듭니다.</p><p><a href="https://www.instagram.com/thingthingclub/" target="_blank" rel="noopener noreferrer">Instagram · @thingthingclub ↗</a></p>'+nav,'about')
# The interactive profile and its readable page use the same background facts.
profile_source = ROOT/'profile-film.js'
if profile_source.exists():
 match = re.search(r'const profileFacts = (.*?);\n', profile_source.read_text())
 if match:
  facts = json.loads(match[1])
  for section in facts.values():
   items=''.join('<li>'+('<small>'+esc(item[2])+'</small> · ' if len(item)>2 and item[2] else '')+'<strong>'+esc(item[0])+'</strong><p>'+('<a href="'+esc(item[3])+'" target="_blank" rel="noopener noreferrer">'+esc(item[1])+' · 바로가기 ↗</a>' if len(item)>3 and item[3] else esc(item[1]))+'</p></li>' for item in section['items'])
   pages['/profile/']['content']+='<section><h2>'+esc(section['title'])+'</h2><ul>'+items+'</ul></section>'
def listing(mode=None):
 return '<ul>'+''.join(f'<li><a href="/projects/{esc(k)}/">{esc(p["name"])}</a> — {esc(p["role"])} · {esc(p["period"])}</li>' for k,p in projects.items() if mode is None or p['mode']==mode)+'</ul>'
category_nav='<nav aria-label="작업 분야">'+''.join(f'<a href="/archive/{slug}/">{label}</a> ' for slug,label in [('artwork','Artwork'),*labels.values()])+'</nav>'
add('/archive/','Archive — Zoonii의 디자인 · 일러스트레이션 작업','Zoonii의 일러스트레이션, UI/UX, 브랜딩과 편집 디자인 프로젝트 목록. 작품 이미지와 상세 설명은 준비 중입니다.','<h1>Zoonii Archive</h1>'+category_nav+listing()+'<p>프로젝트 이미지 · 상세 준비 중</p>','files')
artworks=json.loads((ROOT/'artwork-gallery.json').read_text())
def artwork_content():
 figures=[]
 for i,art in enumerate(artworks):
  fields={key:esc(art[key]) for key in ['id','title','client','year','src','frame','background']}
  figures.append(f'''<figure class="aw-work aw-work-{fields['id']}" data-aw-id="{fields['id']}"><button type="button" class="aw-picture aw-frame-{fields['frame']}" data-aw-open data-aw-src="{fields['src']}" data-aw-title="{fields['title']}" data-aw-client="{fields['client']}" data-aw-year="{fields['year']}" style="--aw-bg:{fields['background']}" aria-label="{fields['title']} 크게 보기" aria-haspopup="dialog"><img src="{fields['src']}" alt="{fields['client']} — {fields['title']}" width="{int(art['width'])}" height="{int(art['height'])}" loading="{'eager' if i<3 else 'lazy'}" decoding="async"></button><figcaption><span class="aw-work-number">{i+1:02d}</span><div><strong>{fields['title']}</strong><span>{fields['client']}</span></div><time>{fields['year']}</time></figcaption></figure>''')
 return '<div class="aw-readable-nav">'+category_nav+'</div><div class="aw-gallery"><header class="aw-heading"><h1>Artwork</h1><span class="aw-total">'+f'{len(artworks):02d} works'+'</span></header><div class="aw-grid">'+''.join(figures)+'</div></div>'
add('/archive/artwork/','Artwork — Zoonii','김주연 / Zoonii의 아트워크 갤러리. 다채로운 색과 장면으로 이어지는 일러스트레이션 작품 모음.',artwork_content(),'files',mode='ARTWORK')
for mode,(slug,label) in labels.items():
 add('/archive/'+slug+'/',label+' — Zoonii',f'김주연 / Zoonii의 {label} 프로젝트 목록과 작업 역할.','<h1>'+label+'</h1>'+category_nav+listing(mode)+'<p>프로젝트 이미지 · 상세 준비 중</p>','files',mode=mode)
def career_table(section, title, headings, fields, records):
 head=''.join('<th scope="col">'+esc(heading)+'</th>' for heading in headings)
 rows=[]
 for record in records:
  record_id=' data-career-project="'+esc(record['id'])+'"' if section=='projects' else ''
  cells=''.join('<td>'+esc(record.get(field,''))+'</td>' for field in fields)
  rows.append('<tr'+record_id+'>'+cells+'</tr>')
 return '<section data-career-section="'+section+'"><h2>'+esc(title)+'</h2><table><thead><tr>'+head+'</tr></thead><tbody>'+''.join(rows)+'</tbody></table></section>'
def career_list(section, title, items):
 return '<section data-career-section="'+section+'"><h2>'+esc(title)+'</h2><ul>'+''.join('<li>'+esc(item)+'</li>' for item in items)+'</ul></section>'
def career_content():
 intro=career['intro']
 content='<h1>'+esc(intro['name'])+'의 작업 이력</h1><p>'+esc(' · '.join(intro['roles']))+'</p><p>'+esc(intro['description'])+'</p>'
 content+=career_table('employment','소속 및 핵심 경력',['기간','회사 / 소속','역할'],['period','title','role'],career['employment'])
 categories={'illustration':'일러스트레이션','branding':'그래픽·브랜딩','uiux':'UI/UX'}
 project_records=[dict(record, category_label=' · '.join(categories[category] for category in record.get('categories',[record['category']]))) for record in career['projects']]
 content+=career_table('projects','프로젝트',['기간','프로젝트 / 회사','역할','분야'],['period','title','role','category_label'],project_records)
 saltware=career['saltware']
 content+='<section data-career-section="saltware"><h2>솔트웨어 / 포털 시스템 디자인·퍼블리싱 ('+esc(saltware['period'])+')</h2><p>'+esc(saltware['description'])+'</p><ul>'+''.join('<li>'+esc(item)+'</li>' for item in saltware['projects'])+'</ul></section>'
 content+=career_table('education','학력',['기간','학교','전공','상태'],['period','title','detail','status'],career['education'])
 content+=career_table('teaching','강의',['기간','기관','내용','상태'],['period','title','role','status'],career['teaching'])
 content+=career_table('exhibitions','전시·라이브 페인팅',['기간','전시 / 행사','내용'],['period','title','role'],career['exhibitions'])
 content+=career_list('fairs','페어 / Thingthingclub',career['fairs'])
 content+=career_list('qualifications','수상·자격',career['qualifications'])
 content+=career_list('notes','이력서 기재 상태',career['notes'])
 return content
add('/career/','Career — 김주연 / Zoonii의 작업 이력','김주연 / Zoonii의 UI/UX, 일러스트레이션, 브랜딩 프로젝트와 디자인 교육 이력.',career_content(),'career')
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

# These are the existing archive cover treatments, not proposed client identities.
brand_covers = {
 'branding0': {'title':['Astar','Corp.'], 'kind':'CI / BI', 'tone':'#244b40', 'ink':'#f2ead8'},
 'branding1': {'title':['플린더스'], 'kind':'Package', 'tone':'#eaa493', 'ink':'#5c2a21'},
 'branding2': {'title':['비기닝','랩'], 'kind':'Coffee', 'tone':'#d8db91', 'ink':'#39452a'},
 'branding3': {'title':['Perfume'], 'kind':'Brand identity', 'tone':'#d6c6df', 'ink':'#4c3457'},
 'branding4': {'title':['KISA'], 'kind':'Report', 'tone':'#e4a266', 'ink':'#493024'},
 'chimpsburger': {'title':['CHIMPS','BURGER'], 'kind':'Brand renewal', 'tone':'#e4bd55', 'ink':'#342d20'}
}
def brand_case_content(key, p):
 design = brand_covers[key]
 number = f'{list(brand_covers).index(key)+1:02d}'
 title = ''.join('<span>'+esc(line)+'</span>' for line in design['title'])
 # Translate the two shorthand source descriptions; all other scope labels are
 # taken directly from the project's comma-separated description.
 description = {'package':'패키지 디자인', 'editorial':'보고서 편집 디자인'}.get(p['description'], p['description'])
 deliverables = ''.join(f'<li><span class="be-deliverable-number">{i:02d}</span><strong>{esc(scope.strip())}</strong></li>' for i,scope in enumerate(description.split(','), 1))
 return f'''<article class="project-case case-visual brand-exhibit be-{esc(key)}" style="--be-tone:{esc(design['tone'])};--be-ink:{esc(design['ink'])}" data-brand-project="{esc(key)}">
 <header class="be-hero"><div class="be-heading"><h1>{esc(p['name'])}</h1><p class="be-classification"><span>{esc(design['kind'])}</span><span>{esc(p['period'])}</span></p></div><div class="be-poster" aria-hidden="true"><div class="be-display">{title}</div><span class="be-index">{number}</span></div><div class="be-hero-footer"><span>BRAND / EDITORIAL</span><button type="button" data-brand-scroll class="be-scroll" aria-label="작업 범위 보기">Explore ↓</button></div></header>
 <section class="be-information"><div class="be-overview"><p class="be-section-kicker">PROJECT DETAILS</p><h2>작업 범위</h2><dl><div><dt>YEAR</dt><dd>{esc(p['period'])}</dd></div><div><dt>TYPE</dt><dd>{esc(design['kind'])}</dd></div><div><dt>DESIGNER</dt><dd>김주연 / Zoonii</dd></div></dl></div><ol class="be-deliverables">{deliverables}</ol></section>
 <footer class="be-footer"><p class="be-availability">작업 이미지 준비 중</p><a href="/archive/branding/">← Back to archive</a><span>김주연 / Zoonii</span></footer></article>'''

# This pending cover intentionally has no generic sample chapters.
# Illustration books with their real pages. Every line of text comes from the artist's own
# project PDF for that work; images are regions of the same PDF under assets/illustration-projects/,
# listed as (file, alt, width, height). Drawings on white are exported with the white removed so the page shows through.
# 'cover' is the PDF's own cover page; the book reader swaps it for the shelf cover.
def book_plate(folder, spec):
 name,alt,width,height=spec
 return f'<figure class="case-media book-plate"><img src="/assets/illustration-projects/{folder}/{name}.webp" alt="{esc(alt)}" width="{width}" height="{height}" decoding="async"></figure>'
story_books={
 'illustration0': {'folder':'umbro','cover':('cover-page','2026 Summer T-Shirt Key Visual — Diamond Escape',1200,765),
  'summary':'엄브로(UMBRO) 2026 여름 시즌 티셔츠 컬렉션의 키비주얼 일러스트레이션 작업입니다. 캐릭터 디자인부터 레터링, 전체 그래픽까지 하나의 무드로 이어지도록 구성했습니다.',
  'meta':[('CLIENT','UMBRO'),('WORK','Key Visual Illust · Lettering · Character Design'),('ILLUSTRATED BY','JuyeonKim'),('YEAR','2026')],
  'intro':'UMBRO 2026 여름 시즌 티셔츠 키비주얼 일러스트레이션 협업',
  'sections':[
   ('Concept','모든 길은 해변으로 이어지고, 모든 파도는 보물을 품고 있다.',['이번 컬렉션은 \'여름 휴가\'를 하나의 여정처럼 풀어냈습니다.','보물지도를 펼쳐 떠나는 여행에서, 도착한 해변에서의 나른한 하루,','그리고 그 끝에 만나는 진짜 보물까지 — 각 디자인은 여정의 한 장면입니다.'],
    [('concept-lettering','UMBRO Vacation 레터링',900,420),('cover-page','2026 Summer T-Shirt Key Visual — Diamond Escape',1200,765),('concept-slogan','Every road leads to the shore, every wave holds a treasure',1200,262)]),
   ('Chapter.1','Diamond Escape',['파도와 바퀴, 그리고 주말.','클래식 카에 서프보드를 싣고, 사막을 가로질러 시작되는 여정'],
    [('ch1-key','Diamond Escape 키비주얼',900,969),('ch1-source','Diamond Escape — Graphic Source, Lettering',1000,874),('ch1-tees','Diamond Escape 티셔츠',1200,834)]),
   ('Chapter.2','The Treasure Map',['여정의 시작. 보물지도 위에 표시한 휴식지들.','지도 위 다이아 마크는 내가 찾고 싶은 순간들의 좌표.'],
    [('ch2-key','The Treasure Map 키비주얼',860,1244),('ch2-source','The Treasure Map — Graphic Source, Lettering',1000,837),('ch2-tees','The Treasure Map 티셔츠',1200,834)]),
   ('Chapter.3','Diamond on the Coast',['마침내 도착한 휴양지의 전경.','야자수와 파도, 백사장이 펼쳐진 여름의 한복판.','보물같은 풍경을 보는 순간'],
    [('ch3-key','Diamond on the Coast 키비주얼',900,776),('ch3-source','Diamond on the Coast — Graphic Source, Lettering',1000,877),('ch3-tees','Diamond on the Coast 티셔츠',1200,834)]),
   ('Chapter.4','Claim The Treasure',['선베드에 몸을 맡기고 시간조차 잊는,','다이아몬드처럼 찬란한 하루.'],
    [('ch4-key','Claim The Treasure 키비주얼',860,1067),('ch4-source','Claim The Treasure — Graphic Source, Lettering',1000,965),('ch4-tees','Claim The Treasure 티셔츠',1200,834)]),
   ('Chapter.5','UMBRO',['긴 여행 끝에 얻은 보물상자.','지금까지의 여정이 피어난 엄브로의 로고'],
    [('ch5-key','UMBRO 키비주얼',1000,899),('ch5-source','UMBRO — Graphic Source, Lettering',1000,905),('ch5-tees','UMBRO 티셔츠',1200,834)]),
   ('Summer Story','UMBRO × JuyeonKim',['ⓒ UMBRO. All rights reserved.'],
    [('summer-story','UMBRO Summer Story — Diamond Escape',1200,834),('credits','UMBRO × JuyeonKim — Client UMBRO, Illustrated by JuyeonKim, Year 2026',1000,418)])]},
 'illustration1': {'folder':'ottogi','cover':('cover-page','와이로운 독립생활 — Package Key Visual & illustration, Illustrated by Thingthingclub',1200,675),
  'summary':'독립생활의 하루를 한 채의 집 안에 담았습니다. KT Y와 오뚜기가 함께한 1인 가구 독립생활 응원 프로젝트입니다. 쉬고, 먹고, 청소하고, 잠드는 평범한 하루를 네 개의 방으로 나누고, 각 장면을 캐릭터와 생활 소품으로 구성해 하나의 작은 집으로 연결했습니다.',
  'meta':[('CLIENT','KT × 오뚜기'),('WORK','Key Visual Illustration · Character Illustration · Package Graphic'),('ILLUSTRATED BY','Thingthingclub'),('YEAR','2025')],
  'intro':'와이로운 독립생활 — Package Key Visual & illustration',
  'sections':[
   ('Concept','혼자 살아도, 나만의 생활은 계속된다.',['독립생활은 거창한 사건보다 작은 루틴으로 만들어집니다.','누군가는 소파에서 쉬고, 누군가는 한 끼를 챙기고,','누군가는 집을 돌보고, 누군가는 침대에서 하루를 마무리합니다.'],
    [('concept-rooms','4 Routines, 4 Rooms — 펭귄, 다람쥐, 코끼리, 파랑새의 방',1200,342),('cover-page','와이로운 독립생활 — Package Key Visual & illustration, Illustrated by Thingthingclub',1200,675),('concept-banner','4 Routines, 4 Rooms, 1 House — A house full of little routines. 각자의 작은 생활들이 모여 하나의 독립생활이 됩니다.',1000,262)]),
   ('Key Idea','각자의 삶이 있는 하나의 공간',['각각의 일상 장면을 독립된 컷으로','보여주는 데서 끝내지 않고,','실제 패키지 형태와 연결되는','‘집’의 구조로 통합했습니다.'],
    [('idea-top','펭귄 — 소파에서 보내는 나만의 시간, 다람쥐 — 혼자여도 입안가득 챙기는 한 끼',1000,608),('idea-bottom','코끼리 — 나의 공간을 직접 돌보는 생활, 파랑새 — 가장 편안한 방식으로 끝내는 하루',1000,589)]),
   ('Early Sketch','From scenes to structure',['01 SCENE 4개의 생활 공간','02 HOUSE 하나의 집으로 통합','03 PACKAGE 실물 전개 구조에 적용'],
    [('sketch-scene','01 SCENE 4개의 생활 공간 스케치',900,1040),('sketch-house','02 HOUSE 하나의 집으로 통합 스케치',900,1060),('sketch-package','03 PACKAGE 실물 전개 구조에 적용 스케치',900,1039)]),
   ('Final Illustration','와이로운 독립생활',[],
    [('final','와이로운 독립생활 Final Illustration',1000,1098)]),
   ('Package Design','그림 속 집이 실제 패키지가 되도록',['외부에서는 캐릭터들의 독립생활이 보이고,','패키지를 열면 실제 오뚜기 제품이 집 안의 팬트리처럼 나타납니다.'],
    [('package-closed','와이로운 독립생활 패키지 외부',900,980),('package-open','패키지를 열면 나타나는 오뚜기 제품',900,979)]),
   ('Package Detail 01','내 이름을 적는 순간, 우리 집이 되는 순간.',['“___의 밥상” 영역에 직접 이름을 적을 수 있도록 패키지 전면에 네임 플레이트를 구성했습니다.'],
    [('detail1-names','“___의 밥상” 네임 플레이트',800,1002),('detail1-hand','패키지 전면 네임 플레이트에 이름을 적는 모습',1000,988)]),
   ('Package Detail 02','패키지의 일부가 집의 일부로',['패키지 구조 일부를 활용해 스마트폰을','세워둘 수 있는 오브젝트로 확장했습니다.','그래픽을 보는 경험에서 끝나지 않고','실제 독립생활 속 사용 경험까지 연결합니다.'],
    [('detail2-window','패키지와 스마트폰을 세워둔 오브젝트',900,1038),('detail2-stand','패키지 구조 일부를 활용한 스마트폰 오브젝트',900,1040)]),
   ('Package Detail 03','집 안을 채우는 1인 가구의 한 끼.',['밥, 소스, 참치, 케첩 등 실제 생활에서 쉽게 사용할 수 있는 제품이','패키지 컨셉 속에서 하나의 ‘팬트리’처럼 구성됩니다.','PACK + PRODUCTS','제품을 단순히 담는 상자가 아닌 독립생활의 장면을 경험하는 패키지로'],
    [('detail3-house','와이로운 독립생활 패키지',800,904),('detail3-products','PACK + PRODUCTS — 패키지에 담긴 오뚜기 제품',1000,850)]),
   ('오뚜기 공식 홈페이지','뉴스룸에 소개된 와이로운 독립생활 캠페인',['KT와 오뚜기가 2034세대 1인 가구를 응원하는','캠페인을 진행하며, 오뚜기 공식 홈페이지 뉴스룸에서','Y 아티스트‘띵띵클럽’의 패키지 디자인 협업을 소개했습니다.','출처 : otoki.com / PR / Newsroom'],
    [('newsroom','오뚜기 공식 홈페이지 뉴스룸 기사',720,1312)]),
   ('KT Y × OTTOGI','와이로운 독립생활',['Package Key Visual & Illustration'],
    [('instagram','yspotlight 인스타그램 와이로운 독립생활 게시물',900,959),('closing','와이로운 독립생활 — KT Y × OTTOGI, Package Key Visual & Illustration',1000,845)])]},
}
def story_book_content(key, p):
 book=story_books[key]
 slug,label=labels[p['mode']]
 meta=''.join(f'<div><dt>{esc(term)}</dt><dd>{esc(value)}</dd></div>' for term,value in book['meta'])
 sections=''
 for eyebrow,title,copy,media in book['sections']:
  grid=''.join(book_plate(book['folder'],item) for item in media)
  sections+=f'<section class="case-section"><div class="case-section-heading"><span>{esc(eyebrow)}</span><h2>{esc(title)}</h2>{"<p>"+"<br>".join(esc(line) for line in copy)+"</p>" if copy else ""}</div><div class="case-grid case-grid-{len(media)}">{grid}</div></section>'
 return f'''<article class="project-case case-story">
 <header class="case-header"><div class="case-eyebrow"><a href="/archive/{slug}/">← Archive</a><span>ILLUSTRATION / SELECTED WORK</span></div><h1>{esc(p['name'])}</h1><p class="case-summary">{esc(book['summary'])}</p><dl class="case-meta">{meta}</dl></header>
 <figure class="case-media case-cover" style="--media-ratio:{book['cover'][2]} / {book['cover'][3]}"><img src="/assets/illustration-projects/{book['folder']}/{book['cover'][0]}.webp" alt="{esc(book['cover'][1])}" width="{book['cover'][2]}" height="{book['cover'][3]}" decoding="async"></figure>
 <div class="case-intro"><span>ABOUT THE PROJECT</span><h2>{esc(book['intro'])}</h2></div>
 {sections}<footer class="case-footer"><span>THANK YOU FOR WATCHING</span><a href="/archive/{slug}/">← Back to ILLUSTRATION</a><small>김주연 / Zoonii</small></footer></article>'''
pending_content={'illustration5':'<article class="project-case case-story"><header class="case-header"><div class="case-eyebrow"><a href="/archive/illustration/">← Archive</a><span>ILLUSTRATION</span></div><h1>KT Y × 서일페</h1><p class="case-summary">프로젝트 상세 내용을 준비 중입니다.</p></header><figure class="case-media" style="--media-ratio:4 / 5"><div><figcaption>KT Y × 서일페</figcaption><small>표지 · 상세 준비 중</small></div></figure></article>'}
for key,p in projects.items():
 path='/projects/'+key+'/'
 desc=p['name']+' — '+p.get('description',p['role'])+'. Zoonii의 '+labels[p['mode']][1]+' 프로젝트.'+('' if key in story_books else ' 상세 준비 중입니다.')
 work={'@type':'CreativeWork','@id':origin+path+'#work','name':p['name'],'url':origin+path,'creator':{'@id':person['@id']},'description':p.get('description',p['role']),'genre':labels[p['mode']][1]}
 content=brand_case_content(key,p) if p['mode']=='VISUAL' else pending_content[key] if key in pending_content else story_book_content(key,p) if key in story_books else case_content(p)
 content=re.sub(r'(?m)^[ \t]+$', '', content)
 content=project_cases.apply(key,content)
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
