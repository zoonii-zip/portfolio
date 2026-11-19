#!/bin/zsh
# Rebuilds assets/career-desktop/: the app icons that sit on the Career desktop.
# Each is a square crop of a real work's cover; the tile shape and shadow come from career-flow.css.
# Needs ffmpeg and cwebp.
set -e
cd "$(dirname "$0")/.."
out=assets/career-desktop
mkdir -p $out
# icon <source> <name> <square crop> [scaler]
icon() {
  ffmpeg -v error -y -i "$1" -vf "$3,scale=288:288:flags=${4:-lanczos}" -frames:v 1 $out/$2.png
  cwebp -quiet -q 82 $out/$2.png -o $out/$2.webp && rm $out/$2.png
}
icon assets/illustration-covers/tongkeun-cover.webp tongkeun "crop=855:855:0:300"
icon assets/illustration-covers/umbro-poster.webp umbro "crop=960:960:0:160"
icon assets/illustration-covers/unesco-cover.webp unesco "crop=1000:1000:100:100"
icon assets/illustration-covers/kty-ottogi-cover.webp ottogi "crop=900:900:30:230"
icon assets/illustration-covers/konai-cover.webp konai "crop=800:800:50:200"
icon assets/illustration-covers/ok-savings-cover.webp ok "crop=900:900:30:230"
icon assets/illustration-covers/kty-sif-cover.webp sif "crop=480:480:360:0"
icon assets/web-projects/luck/element-projects.webp luck "crop=340:340:0:0" neighbor
# Cut-outs with their own outline: the Career sticker and the site's folder mark keep their transparency.
ffmpeg -v error -y -i assets/navigation/board-icons.webp -vf "crop=560:560:70:650,scale=320:320:flags=lanczos" -frames:v 1 $out/career.png
cwebp -quiet -q 86 -alpha_q 90 $out/career.png -o $out/career.webp && rm $out/career.png
ffmpeg -v error -y -i assets/intro-folder-logo.png -vf "crop=3360:2800:320:60,scale=384:320:flags=lanczos" -frames:v 1 $out/folder.png
cwebp -quiet -q 86 -alpha_q 90 $out/folder.png -o $out/folder.webp && rm $out/folder.png
