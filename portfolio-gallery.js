/* Flat image folders arranged along a diagonal project index. */
(() => {
  const tones=['#c4d2ee','#d6dfcc','#f1d983','#edc0b1','#c7c1e5'];
  function mount(){
    const target=document.querySelector('#zz-fullscreen .theme-product .collection-objects');
    if(!target||target.dataset.portfolioReady)return;
    const sources=[...target.querySelectorAll('.project-folder')];
    if(!sources.length)return;
    const projects=sources.map(card=>({name:card.querySelector('.folder-caption strong').textContent,role:card.dataset.description||card.querySelector('.folder-caption > span').textContent,period:card.querySelector('.folder-caption small').textContent,href:card.getAttribute('href')}));
    target.dataset.portfolioReady='true';target.classList.add('flat-folders');target.setAttribute('aria-label','웹·앱 프로젝트 폴더');
    target.innerHTML='<div class="ff-stage"></div><div class="ff-current" aria-live="polite"><span></span><div><strong></strong><time></time><small></small></div></div>';
    const stage=target.querySelector('.ff-stage'),info=target.querySelector('.ff-current');
    function select(i){
      [...stage.children].forEach((n,j)=>n.classList.toggle('is-active',i===j));
      info.querySelector('span').textContent=String(i+1).padStart(2,'0')+' / '+String(projects.length).padStart(2,'0');
      info.querySelector('strong').textContent=projects[i].name;info.querySelector('time').textContent=projects[i].period;info.querySelector('small').textContent=projects[i].role;
    }
    projects.forEach((p,i)=>{
      const link=document.createElement('a');link.href=p.href;link.className='ff-project';link.style.setProperty('--i',i);link.style.setProperty('--tone',tones[i%tones.length]);link.setAttribute('aria-label',p.name+' 포트폴리오 열기');link.setAttribute('aria-haspopup','dialog');
      link.innerHTML='<span class="ff-tab"></span><span class="ff-body"><span class="ff-image"><img alt="" width="1080" height="608"></span></span><span class="ff-number"></span>';
      link.querySelector('img').src='/assets/web-projects/'+p.href.split('/').filter(Boolean).pop()+'.svg';
      link.querySelector('.ff-number').textContent=String(i+1).padStart(2,'0');
      const caption=document.createElement('span');caption.className='ff-caption';
      const name=document.createElement('span');name.textContent=p.name;
      const year=document.createElement('small');year.textContent=p.period;
      caption.append(name,year);link.append(caption);
      link.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')select(i)});link.addEventListener('focus',()=>select(i));stage.append(link);
    });
    select(0);
  }
  const body=document.getElementById('zz-body');if(body)new MutationObserver(mount).observe(body,{childList:true,subtree:true});mount();
})();
