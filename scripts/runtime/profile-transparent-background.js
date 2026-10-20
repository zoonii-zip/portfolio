(()=>{
let result=null,pending=null;
function cutout(src){if(result)return Promise.resolve(result);if(pending)return pending;pending=new Promise((resolve,reject)=>{const photo=new Image();photo.crossOrigin='anonymous';photo.onload=()=>{try{const c=document.createElement('canvas');c.width=photo.naturalWidth;c.height=photo.naturalHeight;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(photo,0,0);const data=ctx.getImageData(0,0,c.width,c.height),p=data.data,w=c.width,h=c.height;const seen=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,tail=0;
function visit(i){if(i<0||i>=w*h||seen[i])return;seen[i]=1;const k=i*4,r=p[k],g=p[k+1],b=p[k+2];if(r>207&&g>201&&b>185&&b<252&&Math.max(r,g,b)-Math.min(r,g,b)<43){queue[tail++]=i}}
for(let x=0;x<w;x++){visit(x);visit((h-1)*w+x)}for(let y=0;y<h;y++){visit(y*w);visit(y*w+w-1)}
// Negative spaces inside the cyan letterforms; eye and mouth photo cutouts stay intact.
[[.32,.55],[.52,.55],[.705,.51]].forEach(([x,y])=>visit(Math.round(y*h)*w+Math.round(x*w)));
while(head<tail){const i=queue[head++];p[i*4+3]=0;const x=i%w;if(x)visit(i-1);if(x<w-1)visit(i+1);if(i>=w)visit(i-w);if(i<w*(h-1))visit(i+w)}
ctx.putImageData(data,0,0);result=c.toDataURL('image/png');resolve(result)}catch(e){reject(e)}};photo.onerror=reject;photo.src=src});return pending}
function apply(){document.querySelectorAll('.profile-artwork .zoonii-profile-art:not([data-transparent-profile])').forEach(img=>{img.dataset.transparentProfile='pending';cutout('assets/profile-collage-skin-clean.webp').then(url=>{img.src=url;img.dataset.transparentProfile='ready'}).catch(()=>{delete img.dataset.transparentProfile})})}
new MutationObserver(apply).observe(document.getElementById('zz-body'),{childList:true,subtree:true});apply();
})();
