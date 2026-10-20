"""Regression checks for shared runtime extraction and asset cache versions."""
from pathlib import Path
import json
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from asset_versions import version_html


class BuildTests(unittest.TestCase):
    def test_versions_follow_content_and_preserve_remote_urls(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            file = root / "app.js"
            file.write_text("const value = 1;")
            remote = '<script src="https://example.com/sdk.js?v=1"></script>'
            html = '<script src="/app.js?v=old"></script>' + remote
            first = version_html(html, root)
            self.assertEqual(first, version_html(first, root))
            self.assertIn(remote, first)
            file.write_text("const value = 2;")
            self.assertNotEqual(first, version_html(first, root))

    def test_seo_build_reads_shared_data_without_inlining_runtime(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "scripts").mkdir()
            for name in ("index.html", "CNAME"):
                shutil.copy2(ROOT / name, root / name)
            for name in ("build-seo.py", "asset_versions.py"):
                shutil.copy2(ROOT / "scripts" / name, root / "scripts" / name)
            shutil.copytree(ROOT / "scripts/runtime", root / "scripts/runtime")
            subprocess.run(
                [sys.executable, str(root / "scripts/build-seo.py")],
                check=True, capture_output=True,
            )
            pages = json.loads(
                (root / "seo-pages.js").read_text().split(" = ", 1)[1].rstrip(";\n")
            )
            self.assertEqual(len(pages), 26)
            for route in pages:
                file = root / (route.strip("/") + "/index.html" if route != "/" else "index.html")
                html = file.read_text()
                self.assertIn('/scripts/runtime/portfolio-home.js?v=', html)
                self.assertNotIn("const projects=", html)
                self.assertEqual(html.count('id="zz-structured-data"'), 1)


if __name__ == "__main__":
    unittest.main()
