"""Build one portable catalogue document, without a bundler or third-party packages."""
from pathlib import Path
import json
root=Path(__file__).resolve().parent
data=json.loads((root/'catalog.json').read_text())
for key,file in [('styles','source-styles.html'),('previewCss','preview.css'),('proposal','proposal.html')]:
    data[key]=(root/file).read_text()
html=(root/'catalog.template.html').read_text()
html=html.replace('<link rel="stylesheet" href="catalog.css">','<style>'+(root/'catalog.css').read_text()+'</style>')
html=html.replace('<script type="module" src="catalog.js"></script>','')
payload=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
html=html.replace('</body>', '<script id="catalog-data" type="application/json">'+payload+'</script><script type="module">'+(root/'catalog.js').read_text()+'</script></body>')
(root/'index.html').write_text(html)
