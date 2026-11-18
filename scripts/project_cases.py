"""Case pages built from a project's real deliverable. build-seo.py passes every project page through apply().

Only material that exists in the delivered files goes in: measured colours, the fonts embedded in the
file, and cuts of the delivered page. No written rationale is added here.
"""
import html, re

esc = lambda x: html.escape(str(x), quote=True)


def device_frame(kind, label, images, ratio='16 / 10', background='#fff', caption=''):
    """A drawn 'monitor' or 'phone' (device-frame.css) whose screen scrolls through `images`.

    images: [(src, width, height, alt)] stacked top to bottom; give real pixel sizes so the page does not jump.
    label:  what the screen holds, read out to screen-reader users and shown nowhere else.
    """
    tiles = ''.join(
        f'<img src="{esc(src)}" alt="{esc(alt)}" width="{width}" height="{height}" loading="lazy" decoding="async">'
        for src, width, height, alt in images)
    stand = '<div class="device-stand" aria-hidden="true"></div><div class="device-foot" aria-hidden="true"></div>' if kind == 'monitor' else ''
    note = f'<figcaption>{esc(caption)}</figcaption>' if caption else ''
    return (f'<figure class="device device-{esc(kind)}" style="--screen-ratio:{esc(ratio)};--screen-bg:{esc(background)}">'
            f'<div class="device-body"><div class="device-screen" tabindex="0" role="region" aria-label="{esc(label)}">{tiles}</div></div>'
            f'{stand}{note}</figure>')


def swatches(colours):
    return '<ul class="kit-swatches">' + ''.join(f'<li style="--swatch:{esc(c)}">{esc(c.upper())}</li>' for c in colours) + '</ul>'


def plate(src, width, height, alt, caption='', background='#e9e9e3', ratio='3 / 2', wide=False):
    note = f'<figcaption>{esc(caption)}</figcaption>' if caption else ''
    return (f'<figure class="kit-plate{" is-wide" if wide else ""}" style="--plate:{esc(background)};--plate-ratio:{esc(ratio)}">'
            f'<div><img src="{esc(src)}" alt="{esc(alt)}" width="{width}" height="{height}" loading="lazy" decoding="async"></div>{note}</figure>')


def section(number, english, title, body, extra=''):
    return (f'<section class="case-section{" " + extra if extra else ""}"><div class="case-section-heading"><span>{number} / {esc(english)}</span>'
            f'<h2>{esc(title)}</h2></div>{body}</section>')


def luck():
    """$LUCK landing page. Source: NFT_randingpage02.pdf, one 1920 x 10460 page (the delivered desktop page)."""
    at = '/assets/web-projects/luck/'
    yellow = '#ffc41f'   # the page background, and the ground of every cut below
    kit = ('<div class="case-kit">'
           # Flat colours counted across the delivered page, most used first.
           f'<div class="kit-block"><h3>COLOR</h3>{swatches([yellow, "#ffffff", "#000000", "#14c12c", "#0000ff", "#f97c00", "#333333", "#3ed1da", "#eb2027"])}</div>'
           # Font names as embedded in the PDF.
           '<div class="kit-block"><h3>TYPE</h3><div class="kit-plates">'
           + plate(at + 'type-display.webp', 1080, 420, '노란 바탕에 흰 테두리를 두른 굵은 제목 Get $LUCK, Getting Lucky와 부제 Keep Luck in your wallet', 'Helvetica 93 Extended Black', yellow)
           + plate(at + 'type-copy.webp', 990, 660, 'Lucky letter is a CHAIN LETTER 소제목과 그 아래 본문 세 줄', 'Arial Bold · Arial Bold Italic', yellow)
           + '</div></div>'
           '<div class="kit-block"><h3>ELEMENTS</h3><div class="kit-plates">'
           + plate(at + 'element-cards.webp', 1360, 900, 'WHAT WE DO 구역의 색 라벨이 붙은 흰 카드 세 장과 픽셀 아이콘', 'WHAT WE DO', yellow, '3 / 2', True)
           + plate(at + 'element-projects.webp', 1160, 340, '검은 원 안의 픽셀 아이콘 네 개와 초록 NEW 배지', 'PROJECTS', yellow)
           + plate(at + 'element-buy.webp', 1290, 570, 'Buy on PancakeSwap 버튼과 주소 입력 칸', 'BUY $LUCK', yellow)
           + plate(at + 'element-tokenomics.webp', 1360, 600, '주황·파랑·초록 톱니 모양 배지 세 개와 설명', 'TOKENOMICS', yellow, '9 / 4', True)
           + '</div></div></div>')
    heights = [1308, 1308, 1308, 1308, 1308, 1305]
    tiles = [(f'{at}page-0{i + 1}.webp', 1440, height, '$LUCK 랜딩 페이지 전체 화면' if i == 0 else '') for i, height in enumerate(heights)]
    screen = device_frame('monitor', '$LUCK 랜딩 페이지. 이 화면 안에서 스크롤해 끝까지 볼 수 있습니다.', tiles, '16 / 10', yellow, '화면 안에서 스크롤')
    return section('01', 'Style guide', '스타일 가이드', kit) + section('02', 'Result', '랜딩 페이지', screen, 'case-result')


BODIES = {'uiux4': luck}


def apply(key, content):
    """Swap the sample chapters of a generated case page for the real ones, keeping its header and footer."""
    body = BODIES.get(key)
    if not body:
        return content
    return re.sub(r'(?s)(</header>).*?(<footer class="case-footer">)', lambda match: match[1] + '\n ' + body() + match[2], content, count=1)
