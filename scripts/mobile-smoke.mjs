/* CI-only mobile browser checks. Never submits a form, score, or guestbook note. */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const base = new URL(process.env.APP_BASE_URL || 'http://127.0.0.1:4173');
const output = path.resolve(process.env.MOBILE_SHOTS_DIR || 'work/mobile-screenshots');
const viewports = [
  { width: 320, height: 568 }, { width: 390, height: 844 },
  { width: 430, height: 932 }, { width: 844, height: 390 }
];
const routes = [
  ['home', '/', '#zz-fullscreen'],
  ['profile', '/profile/', '.profile-poster'],
  ['career', '/career/', '.career-scroll'],
  ['illustration', '/archive/illustration/', '.illustration-shelf .ib-spine'],
  ['artwork', '/archive/artwork/', '#zz-body [data-aw-open]'],
  ['branding', '/archive/branding/', '.brand-stamp'],
  ['uiux', '/archive/uiux/', '.ff-project'],
  ['contact', '/contact/', '.contact-picker-trigger'],
  ['guestbook', '/guestbook/', '#zz-leave-note:not([hidden])'],
  ['club', '/thingthingclub/', '.ttc-game [data-skip]']
];
const results = [];
const started = Date.now();
const deadline = started + 155_000;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });

async function screenshot(page, file) {
  await page.screenshot({ path: path.join(output, `${file}.jpg`), type: 'jpeg', quality: 85,
    animations: 'disabled', timeout: 8_000 });
}

async function checkLayout(page, label, { nav = true } = {}) {
  const measurements = await page.evaluate(({ nav }) => {
    const visible = element => {
      const r = element.getBoundingClientRect(), style = getComputedStyle(element);
      return r.width > 0 && r.height > 0 && style.visibility !== 'hidden' &&
        !element.closest('[hidden],[inert]') && r.right > 0 && r.left < innerWidth &&
        r.bottom > 0 && r.top < innerHeight;
    };
    const roots = [document.documentElement, document.querySelector('#zz-overlay.open'),
      ...document.querySelectorAll('dialog[open]')].filter(Boolean);
    const overflow = roots.map(el => ({ element: el.id || el.className || el.tagName,
      width: el.clientWidth, scrollWidth: el.scrollWidth })).filter(r => r.scrollWidth > r.width + 2);
    const targets = nav ? [...document.querySelectorAll('#zz-global-dock button,#zz-fixed-links button,#zz-overview-button')]
      .filter(visible).map(el => { const r = el.getBoundingClientRect(); return {
        name: el.getAttribute('aria-label') || el.textContent.trim(), width: r.width, height: r.height
      }; }) : [];
    return { overflow, smallTargets: targets.filter(r => r.width < 43.5 || r.height < 43.5),
      viewport: { width: innerWidth, height: innerHeight }, navTargets: targets.length };
  }, { nav });
  assert.equal(measurements.overflow.length, 0, `${label}: horizontal overflow ${JSON.stringify(measurements.overflow)}`);
  assert.equal(measurements.smallTargets.length, 0, `${label}: navigation below 44px ${JSON.stringify(measurements.smallTargets)}`);
  return measurements;
}

async function interactions(page, name, prefix) {
  if (name === 'profile') {
    assert.equal(await page.locator('.profile-title .profile-line').count(), 4, 'Profile keeps its four introduction lines');
    await page.locator('.profile-links a').last().scrollIntoViewIfNeeded();
    const controls = await page.locator('.profile-links a').evaluateAll(links => links.map(link => {
      const r = link.getBoundingClientRect(); return { width: r.width, height: r.height, left: r.left, right: r.right };
    }));
    assert(controls.every(r => r.width >= 43.5 && r.height >= 43.5 && r.left >= -1 && r.right <= page.viewportSize().width + 1), 'Profile navigation fits and remains touch sized');
    await screenshot(page, `${prefix}-controls`);
  } else if (name === 'career') {
    await page.locator('.cs-reel-toggle').click();
    assert.equal(await page.locator('.cs-reel-toggle').getAttribute('aria-pressed'), 'true', 'Career reel can pause by tap');
    await page.locator('[data-cs-link="timeline"]').click();
    await page.locator('.cs-journey').waitFor({ state: 'visible' });
    if (page.viewportSize().height <= 520) {
      assert.equal(await page.locator('.cs-journey.cs-rolling').count(), 0, 'Short landscape uses the readable static timeline');
    }
    await checkLayout(page, `${prefix}-timeline`);
    await screenshot(page, `${prefix}-timeline`);
  } else if (name === 'illustration') {
    await page.locator('.illustration-shelf .ib-spine').first().click();
    const book = page.locator('.portfolio-window.is-book[open]');
    await book.waitFor({ state: 'visible' });
    await book.locator('.book-next:not(:disabled)').waitFor({ state: 'visible' });
    const before = await book.locator('.book-page-count').textContent();
    await book.locator('.book-next').click();
    await page.waitForFunction(previous => document.querySelector('.portfolio-window[open] .book-page-count')?.textContent !== previous, before);
    await book.locator('.book-turn-layer').waitFor({ state: 'hidden' });
    await checkLayout(page, `${prefix}-book`, { nav: false });
    await screenshot(page, `${prefix}-book`);
    await book.locator('.book-close').click();
    await book.waitFor({ state: 'hidden' });
  } else if (name === 'artwork') {
    await page.locator('#zz-body [data-aw-open]').first().click();
    const viewer = page.locator('.aw-viewer[open]');
    await viewer.waitFor({ state: 'visible' });
    await checkLayout(page, `${prefix}-viewer`, { nav: false });
    await viewer.locator('.aw-viewer-close').click();
    await viewer.waitFor({ state: 'hidden' });
  } else if (name === 'branding') {
    await page.locator('.brand-stamp').first().click();
    const folio = page.locator('.portfolio-window.is-folio[open]');
    await folio.waitFor({ state: 'visible' });
    // Let the clip reveal finish before comparing the anchored toolbar's geometry.
    await page.waitForFunction(() => {
      const viewer = document.querySelector('.portfolio-window[open]');
      return viewer && viewer.getAnimations().every(animation => animation.playState !== 'running');
    });
    const back = folio.locator('.folio-close');
    const before = await back.boundingBox();
    const scroll = await folio.locator('.pw-content').evaluate(el => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'instant' });
      return { top: el.scrollTop, maximum: el.scrollHeight - el.clientHeight };
    });
    assert(scroll.maximum > 0 && scroll.top > 0, 'Branding detail has scrollable content');
    const after = await back.boundingBox();
    assert(before && after && Math.abs(before.x - after.x) < 2 && Math.abs(before.y - after.y) < 2 && after.x < 80 && after.y < 80,
      'Back to archive stays at the upper left while detail scrolls');
    await checkLayout(page, `${prefix}-detail`, { nav: false });
    await screenshot(page, `${prefix}-detail`);
    await back.click();
    await folio.waitFor({ state: 'hidden' });
  } else if (name === 'uiux') {
    await page.locator('.ff-project').first().click();
    const window = page.locator('.portfolio-window[open]:not(.is-book):not(.is-folio)');
    await window.waitFor({ state: 'visible' });
    await checkLayout(page, `${prefix}-window`, { nav: false });
    await screenshot(page, `${prefix}-window`);
    await window.locator('.pw-close').click();
    await window.waitFor({ state: 'hidden' });
  } else if (name === 'contact') {
    await page.locator('#zz-form input[name="name"]').fill('Mobile preview');
    await page.locator('#zz-form input[name="email"]').fill('preview@example.invalid');
    await page.locator('.contact-picker-trigger').click();
    await page.locator('.contact-picker-options [role="option"]').filter({ hasText: /^Illustration$/ }).click();
    assert.equal(await page.locator('#zz-form select[name="type"]').inputValue(), 'Illustration', 'Contact project picker updates its form value');
    await page.locator('#zz-form textarea[name="message"]').fill('모바일 화면 확인용 · 전송하지 않습니다.');
    assert.equal(await page.locator('#zz-form input[name="email"]').inputValue(), 'preview@example.invalid', 'Contact fields accept input');
    await checkLayout(page, `${prefix}-form`);
    await screenshot(page, `${prefix}-form`);
  } else if (name === 'guestbook') {
    await page.locator('#zz-leave-note').click();
    const composer = page.locator('.guest-compose-dialog[open]');
    await composer.waitFor({ state: 'visible' });
    await checkLayout(page, `${prefix}-composer`, { nav: false });
    await screenshot(page, `${prefix}-composer`);
    await composer.locator('.guest-dialog-close').click();
    await composer.waitFor({ state: 'hidden' });
  } else if (name === 'club') {
    await page.locator('.ttc-game [data-skip]').click();
    await page.locator('.club-collage:not([hidden])').waitFor({ state: 'visible' });
    assert.equal(await page.locator('.club-collage .club-product').count(), 9, 'Club has all nine product links');
    const products = await page.locator('.club-collage .club-product').evaluateAll(items => items.map(item => {
      const r = item.getBoundingClientRect(); return { width: r.width, height: r.height, href: item.href };
    }));
    assert(products.every(item => item.width > 0 && item.height > 0 && item.href.includes('smartstore.naver.com')), 'Club cards retain visible targets and store destinations');
    await checkLayout(page, `${prefix}-products`);
    await screenshot(page, `${prefix}-products`);
  }
}

try {
  await Promise.all(viewports.map(async viewport => {
    const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true,
      deviceScaleFactor: 1, locale: 'ko-KR', reducedMotion: 'no-preference' });
    const blockedWrites = [];
    await context.route('**/*', route => {
      const request = route.request();
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
        blockedWrites.push({ method: request.method(), url: request.url() });
        return route.abort('blockedbyclient');
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(5_000);
    page.setDefaultNavigationTimeout(12_000);
    let errors = [];
    page.on('pageerror', error => errors.push(error.stack || error.message));
    for (const [name, route, ready] of routes) {
      const prefix = `${viewport.width}x${viewport.height}-${name}`;
      const result = { name, route, viewport, ok: false, screenshots: `${prefix}*.jpg` };
      results.push(result);errors = [];
      if (Date.now() > deadline) { result.error = 'Mobile suite time budget exceeded'; continue; }
      try {
        const response = await page.goto(new URL(route, base).href, { waitUntil: 'domcontentloaded' });
        assert(response?.ok(), `Route returned HTTP ${response?.status()}`);
        await page.locator('html.zz-seo-ready').waitFor({ state: 'attached' });
        await page.locator(ready).first().waitFor({ state: 'visible' });
        await page.locator('#zz-fullscreen.travelling').waitFor({ state: 'hidden' });
        await page.evaluate(() => Promise.race([
          document.fonts.ready,
          new Promise(resolve => setTimeout(resolve, 2_000))
        ]));
        if (name === 'home') {
          await screenshot(page, `${prefix}-intro`);
          await page.locator('#zz-scrollboard').click();
          await page.waitForFunction(() => Math.abs(document.getElementById('zz-fullscreen').getBoundingClientRect().top) < 2);
          assert(await page.locator('#zz-world .movable-object').count() >= 7, 'Home keeps its interactive fidget board');
        }
        result.layout = await checkLayout(page, prefix);
        await screenshot(page, prefix);
        await interactions(page, name, prefix);
        assert.equal(errors.length, 0, `Uncaught page errors: ${errors.join('\n')}`);
        result.ok = true;
        console.log(`PASS ${prefix}`);
      } catch (error) {
        result.error = error.stack || String(error);
        console.error(`FAIL ${prefix}: ${error.message}`);
        try { await screenshot(page, `${prefix}-failure`); } catch (shotError) { result.screenshotError = shotError.message; }
      } finally {
        result.pageErrors = [...errors];
      }
    }
    await context.close();
    if (blockedWrites.length) console.log(`${viewport.width}x${viewport.height}: blocked ${blockedWrites.length} background write requests; no form was submitted.`);
  }));
} finally {
  await browser.close();
  const report = { base: base.href, durationMs: Date.now() - started,
    passed: results.filter(r => r.ok).length, failed: results.filter(r => !r.ok).length, results };
  await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`Mobile checks: ${report.passed}/${results.length} passed in ${(report.durationMs / 1000).toFixed(1)}s. Screenshots: ${output}`);
  if (report.failed || results.length !== routes.length * viewports.length) process.exitCode = 1;
}
