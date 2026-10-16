(() => {
  'use strict';
  function init() {
    const form = document.querySelector('#zz-guestform');
    const wall = document.querySelector('#zz-guestresult');
    if (!form || !wall) return;
    const config = window.ZooniiGuestbookConfig || {};
    const button = form.querySelector('.guest-stick');
    const status = document.querySelector('#zz-guest-status');
    const challenge = document.createElement('div');
    challenge.className = 'guest-challenge';
    button.before(challenge);
    const verificationStatus = document.createElement('p');
    verificationStatus.className = 'guest-verification-status';
    verificationStatus.setAttribute('role', 'status');
    verificationStatus.hidden = true;
    button.before(verificationStatus);
    const refresh = document.createElement('button');
    refresh.type = 'button'; refresh.textContent = '메모 새로고침'; refresh.className = 'guest-refresh';
    wall.before(refresh);
    let entries = [], token = '', widget, busy = false, loading = false;
    let visitor = crypto.randomUUID();
    try {
      const saved = localStorage.getItem('zoonii-guestbook-visitor');
      if (/^[0-9a-f-]{36}$/i.test(saved || '')) visitor = saved;
      localStorage.setItem('zoonii-guestbook-visitor', visitor);
    } catch { /* Storage is optional; never store the guestbook itself locally. */ }
    const ready = Boolean(config.endpoint && config.turnstileSiteKey);
    const message = text => { status.textContent = text; };
    function updateButton() { verificationStatus.hidden = !token; verificationStatus.textContent = token ? '✓ 인증 성공' : ''; button.disabled = !ready || !token || busy; button.textContent = busy ? '붙이는 중…' : '메모 붙이기'; }
    function render() {
      wall.replaceChildren();
      wall.style.removeProperty('min-height');
      if (!entries.length) {
        const empty = document.createElement('p'); empty.className = 'guest-empty';
        empty.textContent = loading ? '메모를 불러오는 중이에요…' : '아직 메모가 없어요. 첫 인사를 남겨주세요!';
        wall.append(empty);
      }
      entries.forEach((entry, index) => {
        const card = document.createElement('article');
        card.className = 'wall-note paper-' + (['yellow','pink','lined','ticket','house'].includes(entry.paper) ? entry.paper : 'yellow');
        card.style.setProperty('--note-rotation', [-3,2,-1,3][index % 4] + 'deg');
        const text = document.createElement('p'); text.textContent = entry.text;
        const name = document.createElement('small'); name.textContent = entry.name;
        const date = document.createElement('time');
        const parsed = new Date(entry.created_at);
        if (!Number.isNaN(parsed.getTime())) { date.dateTime = parsed.toISOString(); date.textContent = parsed.toLocaleDateString('ko-KR'); }
        card.append(text, name, date); wall.append(card);
      });
    }
    window.ZooniiGuestbook = { render };
    async function request(options) {
      const response = await fetch(config.endpoint, { ...options, signal: AbortSignal.timeout(15000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '요청을 처리하지 못했어요.');
      return data;
    }
    async function load() {
      if (!ready || loading || busy) return;
      loading = true; refresh.disabled = true;
      if (!entries.length) render();
      try {
        const data = await request(); entries = data.entries; loading = false; render();
        message('같은 브라우저에서 다시 쓰면 이전 메모가 교체돼요. 닉네임과 글은 공개돼요.');
      } catch {
        message('메모를 불러오지 못했어요. 새로고침을 눌러 다시 시도해주세요.');
        if (!entries.length) { wall.replaceChildren(); const p = document.createElement('p'); p.textContent = '메모 목록에 연결하지 못했어요.'; wall.append(p); }
      } finally { loading = false; refresh.disabled = false; }
    }
    refresh.addEventListener('click', load);
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy || loading || !token || !ready) return;
      const text = form.elements.note.value.trim();
      if (!text) { form.elements.note.setCustomValidity('한마디를 적어주세요.'); form.reportValidity(); return; }
      if (!form.reportValidity()) return;
      busy = true; updateButton(); refresh.disabled = true;
      // Snapshot inputs and keep them unchanged until the request completes.
      const payload = { name: form.elements.nickname.value.trim(), text, paper: document.querySelector('[data-paper][aria-pressed="true"]')?.dataset.paper || 'yellow', token, visitor };
      form.elements.note.disabled = form.elements.nickname.disabled = true;
      try {
        const data = await request({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        entries = [data.entry, ...entries.filter(e => e.id !== data.entry.id)].slice(0,100); render();
        form.elements.note.value = ''; document.querySelector('#zz-note-count').textContent = '0';
        document.querySelector('.guest-wall').scrollTop = 0;
        message('새 메모를 붙였어요. 이 브라우저의 이전 메모는 새 내용으로 바뀌어요.');
      } catch (error) { message(error.message === 'Failed to fetch' || error.name === 'TimeoutError' ? '연결이 끊겼어요. 새로고침으로 등록 여부를 확인한 뒤 다시 시도해주세요.' : error.message); }
      finally {
        busy = false; token = ''; refresh.disabled = false;
        form.elements.note.disabled = form.elements.nickname.disabled = false;
        if (widget !== undefined) window.turnstile.reset(widget);
        updateButton();
      }
    });
    button.type = 'submit'; updateButton(); render();
    if (!ready) { refresh.disabled = true; message('방명록 연결을 준비 중이에요. 등록은 곧 열릴 예정이에요.'); return; }
    load();
    // Only create the widget once its form is visible (including SPA navigation).
    function mountChallenge() {
      if (!form.getClientRects().length || !window.turnstile || widget !== undefined) return;
      widget = window.turnstile.render(challenge, {
        sitekey: config.turnstileSiteKey, action: 'guestbook', size: 'flexible', appearance: 'interaction-only',
        callback: value => { token = value; updateButton(); },
        'expired-callback': () => { token = ''; updateButton(); },
        'error-callback': () => { token = ''; updateButton(); message('스팸 방지 확인을 불러오지 못했어요. 페이지를 새로고침해주세요.'); }
      });
    }
    new ResizeObserver(mountChallenge).observe(form);
    window.zooniiGuestbookTurnstileReady = mountChallenge;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=zooniiGuestbookTurnstileReady&render=explicit';
    script.async = true; script.onerror = () => message('스팸 방지 확인에 연결하지 못했어요. 페이지를 새로고침해주세요.');
    document.head.append(script);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
