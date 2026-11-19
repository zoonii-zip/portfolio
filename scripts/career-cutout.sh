#!/bin/zsh
# Rebuilds assets/career-cutout/: the images seen through the cut-out type on Career.
# Each is a crop turned into two inks, orange-red in the shadows and yellow in the lights,
# redder at the top of the sheet and yellower at the bottom. Needs ffmpeg and cwebp.
set -e
cd "$(dirname "$0")/.."
out=assets/career-cutout
mkdir -p $out
# duo <source> <name> <crop> <width> [contrast] [scaler]
duo() {
  ffmpeg -v error -y -i "$1" -vf "$3,scale=$4:-2:flags=${6:-lanczos},eq=contrast=${5:-1.06},format=gray,format=gbrp,geq=r='(222+20*Y/H)+(33-20*Y/H)*r(X,Y)/255':g='(48+44*Y/H)+(104+18*Y/H)*r(X,Y)/255':b='24+(16+26*Y/H)*r(X,Y)/255'" -frames:v 1 $out/$2.png
  cwebp -quiet -q 74 $out/$2.png -o $out/$2.webp && rm $out/$2.png
}
duo assets/career-hero/portrait-7662.jpg me "hflip,crop=760:1095:70:250" 1000 1.2   # mirrored back so the logo reads
duo assets/illustration-covers/tongkeun-cover.webp tongkeun "crop=855:950:0:250" 810
duo assets/illustration-covers/umbro-poster.webp umbro "crop=960:1067:0:100" 810
duo assets/illustration-covers/unesco-cover.webp unesco "crop=900:1000:150:100" 810
duo assets/illustration-covers/kty-ottogi-cover.webp ottogi "crop=860:956:50:200" 810
duo assets/illustration-covers/konai-cover.webp konai "crop=760:844:70:178" 810
duo assets/illustration-covers/ok-savings-cover.webp ok "crop=860:956:50:200" 810
duo assets/illustration-covers/kty-sif-cover.webp sif "crop=432:480:384:0" 810
duo assets/web-projects/luck/element-projects.webp luck "crop=306:340:20:0" 810 1.06 neighbor
