(() => {
 'use strict';
 // Original footage, sampled to a 90 × 160 pixel grid and enlarged with hard edges.
 const film = { src: 'assets/profile-film/money-flavor-03-pixel.mp4', poster: 'assets/profile-film/money-flavor-03-pixel-poster.jpg' };
 const socials = [
  ['Instagram', 'https://www.instagram.com/thingthingclub/'],
  ['YouTube', ''],
  ['TikTok', '']
 ];
 window.ZooniiProfile = {
  hero(artwork = '') {
   return `<div class="profile-page"><section class="profile-film" aria-labelledby="profile-film-title">
    <div class="profile-film-media" aria-hidden="true">${film.src ? `<video class="profile-film-video" src="${film.src}"${film.poster ? ` poster="${film.poster}"` : ''} muted loop playsinline preload="metadata" tabindex="-1"></video>` : ''}</div>
    <div class="profile-film-shade" aria-hidden="true"></div>
    <div class="profile-film-grain" aria-hidden="true"></div>
    <nav class="profile-film-socials" aria-label="소셜 채널">${socials.map(([name, url]) => url
     ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${name} <span aria-hidden="true">↗</span></a>`
     : `<button type="button" disabled aria-label="${name} 링크 준비 중">${name} <span aria-hidden="true">↗</span></button>`).join('')}</nav>
    <div class="profile-film-content">
     <div class="profile-film-main"><div class="profile-film-copy">
     <h2 id="profile-film-title" class="profile-film-title" lang="en"><span>I bring my dreams</span><span>(and yours) to life.</span></h2>
     <div class="profile-film-meta">
      <p class="profile-film-name">Zoonii <span>김주연</span></p>
      <p class="profile-film-disciplines" lang="en">UI/UX & Web Design<br>Illustration & Branding<br>Design Education</p>
      <a class="profile-film-email" href="mailto:illu_junny@naver.com">illu_junny@<br>naver.com ↗</a>
     </div>
     </div><div class="profile-film-portrait">${artwork}</div></div>
     <div class="profile-film-footer">
      <span lang="en">Independent designer<br>& illustrator</span>
      <p>내가 꿈꾸는 것,<br>당신이 꿈꾸는 것을 만듭니다.</p>
      <button type="button" class="profile-film-toggle"${film.src ? '' : ' hidden'} aria-label="배경 영상 재생">Play film ↗</button>
     </div>
    </div>
   </section></div>`;
  }
 };

 function start() {
  const panel = document.getElementById('zz-overlay');
  const body = document.getElementById('zz-body');
  if (!panel || !body) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let video = null, toggle = null, userPaused = reduced.matches;
  function label() {
   if (!video || !toggle) return;
   toggle.textContent = video.paused ? 'Play film ↗' : 'Pause film Ⅱ';
   toggle.setAttribute('aria-label', video.paused ? '배경 영상 재생' : '배경 영상 일시 정지');
  }
  function sync() {
   if (!video) return;
   if (document.hidden || !panel.classList.contains('open') || userPaused) video.pause();
   else video.play().catch(label);
  }
  function connect() {
   const next = body.querySelector('.profile-film-video');
   if (next === video) return;
   video?.pause();
   video = next;
   toggle = body.querySelector('.profile-film-toggle');
   if (!video) return;
   userPaused = reduced.matches;
   panel.scrollTop = 0;
   video.muted = true;
   video.addEventListener('play', label);
   video.addEventListener('pause', label);
   video.addEventListener('error', () => { toggle.hidden = true; });
   toggle.addEventListener('click', () => { userPaused = !video.paused; sync(); });
   label();
   sync();
  }
  new MutationObserver(connect).observe(body, { childList: true });
  new MutationObserver(sync).observe(panel, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', () => { userPaused = reduced.matches; sync(); });
  connect();
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
 else start();
})();
