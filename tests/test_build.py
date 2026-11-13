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
            for name in ("index.html", "CNAME", "artwork-gallery.json"):
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
            self.assertTrue({
                "/archive/artwork/", "/archive/illustration/",
                "/archive/uiux/", "/archive/branding/",
                "/projects/illustration5/",
            }.issubset(pages))
            artwork = pages["/archive/artwork/"]
            self.assertEqual((artwork["action"], artwork["mode"]), ("files", "ARTWORK"))
            self.assertEqual(artwork["content"].count(" data-aw-open"), len(json.loads(
                (root / "artwork-gallery.json").read_text()
            )))
            self.assertLess(
                artwork["content"].index('href="/archive/artwork/"'),
                artwork["content"].index('href="/archive/illustration/"'),
            )
            pending = pages["/projects/illustration5/"]
            self.assertIn("표지 · 상세 준비 중", pending["content"])
            self.assertNotIn("case-section", pending["content"])
            self.assertEqual(pending["schema"]["@graph"][-1]["genre"], "일러스트레이션")
            # Branding details must describe the selected project, rather than
            # repeat fictional process chapters or suggest missing images exist.
            branding = {
                "branding0": ("아스타", "2023", "CI / BI", [
                    "기업 CI·BI", "브랜드 가이드", "회사 소개 자료", "홈페이지",
                ]),
                "branding1": ("플린더스", "2024", "Package", ["패키지 디자인"]),
                "branding2": ("비기닝랩", "2024", "Coffee", ["커피 제품 상세 페이지 디자인"]),
                "branding3": ("향수 브랜딩", "2024", "Brand identity", ["브랜드 아이덴티티"]),
                "branding4": ("KISA 보고서", "2022", "Report", ["보고서 편집 디자인"]),
                "chimpsburger": ("침스버거", "2026.09–10", "Brand renewal", [
                    "캐릭터·로고 브랜딩", "광고판 일러스트", "시트지 2종", "버거·사이드 박스",
                    "메뉴판", "메뉴별 포스터", "벽화",
                ]),
            }
            self.assertEqual(
                {route for route, page in pages.items() if page["action"] == "project" and page["mode"] == "VISUAL"},
                {f"/projects/{key}/" for key in branding},
            )
            for key, (name, year, kind, scope) in branding.items():
                with self.subTest(branding=key):
                    page = pages[f"/projects/{key}/"]
                    content = page["content"]
                    self.assertIn(f'data-brand-file="{key}"', content)
                    self.assertIn(f"<h1>{name}</h1>", content)
                    self.assertIn(f"<dt>YEAR</dt><dd>{year}</dd>", content)
                    self.assertIn(f"<dt>TYPE</dt><dd>{kind}</dd>", content)
                    self.assertIn("<dt>DESIGNER</dt><dd>김주연 / Zoonii</dd>", content)
                    self.assertEqual(content.count('class="bf-deliverable-number"'), len(scope))
                    for deliverable in scope:
                        self.assertIn(f"<strong>{deliverable}</strong>", content)
                    self.assertIn("작업 이미지 준비 중", content)
                    self.assertNotIn("IMAGE PLACEHOLDER", content)
                    self.assertNotIn("LAYOUT PREVIEW", content)
                    self.assertNotIn('class="case-section"', content)
                    self.assertFalse(page["index"])
            for route in pages:
                file = root / (route.strip("/") + "/index.html" if route != "/" else "index.html")
                html = file.read_text()
                self.assertIn('/scripts/runtime/portfolio-home.js?v=', html)
                self.assertNotIn("const projects=", html)
                self.assertEqual(html.count('id="zz-structured-data"'), 1)


if __name__ == "__main__":
    unittest.main()
