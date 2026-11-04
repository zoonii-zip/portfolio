// Store composition from Figma 2873:6866; coordinates relative to its 1309.81 × 774 field.
const layout = {
  1:[381.4,42,222.66,208,-12.71,-16.31,248.07,212.62,186],
  2:[564.4,242,183.36,208,-14.24,-14.55,211.83,209.11,186],
  3:[740.4,77,170.27,198.27,-9.74,-9.74,189.75,189.75,176.27],
  4:[1061.4,37,183.36,208,-16.71,-17.09,216.78,214.19,186.1],
  5:[314.4,353,235.77,183,-8,-25,244,178,161],
  6:[893.4,300,222.66,208,-11.44,-14.62,245.54,209.24,186],
  7:[86.62,528.48,209.56,208,-29.22,-50.48,268,237,186],
  8:[579.4,525,314.34,198,-70,-74,454,282,176],
  9:[1053.4,504,170.27,198.27,-11,-40,221,221,176.26],
};
export function arrangeStore(shop,replay){
  shop.classList.add('club-figma-layout');
  for(const [id,[x,y,w,h,ix,iy,iw,ih,badge]] of Object.entries(layout)){
    const item=shop.querySelector(`.club-product-${id}`);if(!item)continue;
    const vars={sx:x/1309.81*100,sy:y/774*100,sw:w/1309.81*100,sh:h/w*100,ix:ix/w*100,iy:iy/h*100,iw:iw/w*100,ih:ih/h*100,badge:badge/h*100};
    for(const [key,value] of Object.entries(vars))item.style.setProperty(`--${key}`,`${value}%`);
    item.style.setProperty('--fit-width',String(w/774*1.12));
    item.style.setProperty('--center-x',`${(x+w/2)/1309.81*100}%`);
    item.querySelector('img').src=`/assets/club-store-figma/product-${id}.webp`;
  }
  replay.textContent='CART GAME';
  const colophon=shop.querySelector('.club-colophon');
  const storeLink=colophon.querySelector('.club-shop-link');
  storeLink.textContent='GO SMARTSTORE';
  const actions=document.createElement('div');actions.className='club-store-actions';
  actions.append(storeLink,replay);colophon.append(actions);
}
