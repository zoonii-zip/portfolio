/* Keep inquiries on the page even when the mail service is unavailable. */
(() => {
  document.addEventListener('submit', async event => {
    const form = event.target;
    if (!form.matches('#zz-form')) return;
    event.preventDefault();
    if (form.dataset.sending === 'true') return;
    const button = form.querySelector('[type="submit"]');
    let status = form.querySelector('.contact-send-status');
    if (!status) {
      status = document.createElement('p');
      status.className = 'contact-send-status';
      status.setAttribute('role', 'status');
      status.style.cssText = 'grid-column:1/-1;text-align:center;font-size:14px;line-height:1.6;margin:12px 0 0;color:#111';
      form.append(status);
    }
    const data = Object.fromEntries(new FormData(form));
    form.dataset.sending = 'true';
    button.disabled = true;
    status.textContent = '문의 내용을 전송하고 있어요…';
    try {
      const response = await fetch('https://formsubmit.co/ajax/illu_junny@naver.com', {
        method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify(data), signal: AbortSignal.timeout(12000)
      });
      const result = await response.json();
      if (!response.ok || ![true, 'true'].includes(result.success)) throw new Error('Mail not confirmed');
      status.textContent = '문의가 전송되었어요. 감사합니다!';
    } catch {
      status.textContent = '전송을 확인하지 못했어요. 작성 내용은 그대로 남아 있어요. 잠시 후 다시 시도하거나 이메일로 보내주세요. ';
      const link = document.createElement('a');
      link.textContent = '이메일 앱에서 보내기 ↗';
      link.style.cssText = 'color:inherit;text-decoration:underline';
      link.href = 'mailto:illu_junny@naver.com?subject=' + encodeURIComponent('[ZOONII.ZIP] '+(data.type||'문의')) + '&body=' + encodeURIComponent('FROM: '+data.name+'\nEMAIL: '+data.email+'\n\n'+data.message);
      status.append(link);
    } finally {
      form.dataset.sending = 'false';
      button.disabled = false;
    }
  });
})();
