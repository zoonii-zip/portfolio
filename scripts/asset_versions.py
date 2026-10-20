"""Content-based cache versions for local scripts and stylesheets."""
from hashlib import sha256
from pathlib import Path
import re


def version_html(source, root):
    def replace(match):
        attribute, url = match.groups()
        path = url.split("?", 1)[0]
        if "://" in path or path.startswith("//"):
            return match[0]
        file = root / path.lstrip("/")
        if not file.is_file():
            return match[0]
        digest = sha256(file.read_bytes()).hexdigest()[:10]
        return f'{attribute}="{path}?v={digest}"'

    return re.sub(r'(src|href)="([^"]+\.(?:js|css)(?:\?[^"]*)?)"', replace, source)


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    for file in root.rglob("*.html"):
        if "weeks" in file.relative_to(root).parts:
            continue
        source = file.read_text()
        updated = version_html(source, root)
        if updated != source:
            file.write_text(updated)
