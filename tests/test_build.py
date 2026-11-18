"""Regression checks for shared runtime extraction and asset cache versions."""
from pathlib import Path
from html import unescape
import json
import re
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
            for name in ("index.html", "CNAME", "artwork-gallery.json", "career-data.js"):
                shutil.copy2(ROOT / name, root / name)
            for name in ("build-seo.py", "asset_versions.py", "project_cases.py"):
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
            # Career must come exclusively from the latest resume data. Verify
            # complete rows, including statuses and the separately listed portal
            # work, so a legacy-data fallback cannot silently remove or add facts.
            career_data = json.loads(re.search(
                r'window\.ZooniiCareerData\s*=\s*(\{.*\})\s*;\s*$',
                (root / "career-data.js").read_text(), re.S,
            )[1])
            career = pages["/career/"]["content"]

            def career_section(name):
                return re.search(
                    rf'<section data-career-section="{name}">(.*?)</section>',
                    career, re.S,
                )[1]

            def career_rows(name):
                return [
                    [unescape(cell) for cell in re.findall(r'<td>(.*?)</td>', row, re.S)]
                    for row in re.findall(r'<tr[^>]*>(.*?)</tr>', career_section(name), re.S)
                    if '<td>' in row
                ]

            self.assertEqual(pages["/career/"]["action"], "career")
            for value in (career_data["intro"]["name"], career_data["intro"]["description"]):
                self.assertIn(value, unescape(career))
            expected_counts = {
                "employment": 6, "education": 3, "teaching": 6, "exhibitions": 5,
            }
            fields = {
                "employment": ("period", "title", "role"),
                "education": ("period", "title", "detail", "status"),
                "teaching": ("period", "title", "role", "status"),
                "exhibitions": ("period", "title", "role"),
            }
            for section, count in expected_counts.items():
                with self.subTest(career_section=section):
                    self.assertEqual(len(career_data[section]), count)
                    self.assertEqual(career_rows(section), [
                        [record.get(field, "") for field in fields[section]]
                        for record in career_data[section]
                    ])
            categories = {"illustration": "일러스트레이션", "branding": "그래픽·브랜딩", "uiux": "UI/UX"}
            # The approved source removes two digital records and places the
            # existing Chimps project in both relevant fields, without creating
            # a second project or losing its original illustration membership.
            projects = career_data["projects"]
            project_ids = [record["id"] for record in projects]
            self.assertEqual(len(projects), 59)
            self.assertEqual(len(set(project_ids)), 59)
            self.assertTrue({"uiux-02", "uiux-04"}.isdisjoint(project_ids))
            for removed_name in ("Bitplanet", "갤로핑"):
                self.assertNotIn(removed_name, unescape(career))
            self.assertEqual({
                category: sum(record["category"] == category for record in projects)
                for category in categories
            }, {"illustration": 18, "branding": 18, "uiux": 23})

            def memberships(record):
                return record.get("categories", [record["category"]])

            self.assertEqual({
                category: sum(category in memberships(record) for record in projects)
                for category in categories
            }, {"illustration": 18, "branding": 19, "uiux": 23})
            for record in projects:
                self.assertEqual(len(memberships(record)), len(set(memberships(record))))
                self.assertTrue(set(memberships(record)).issubset(categories))
                self.assertIn(record["category"], memberships(record))
            chimps = next(record for record in projects if record["id"] == "illustration-13")
            self.assertEqual(chimps["title"], "Chimps Burger")
            self.assertEqual(chimps["categories"], ["illustration", "branding"])
            self.assertEqual(career_rows("projects"), [
                [record["period"], record["title"], record["role"],
                 " · ".join(categories[category] for category in memberships(record))]
                for record in projects
            ])
            chimps_rows = [row for row in career_rows("projects") if row[1] == "Chimps Burger"]
            self.assertEqual(chimps_rows, [[
                "2022.09", "Chimps Burger", "이전 캐릭터 버전, 키오스크 GUI·포스터 그래픽",
                "일러스트레이션 · 그래픽·브랜딩",
            ]])
            self.assertEqual(re.findall(r'data-career-project="([^"]+)"', career), [
                record["id"] for record in career_data["projects"]
            ])
            for section, count in (("fairs", 3), ("qualifications", 6), ("saltware", 17), ("notes", 1)):
                with self.subTest(career_list=section):
                    items = career_data[section]["projects"] if section == "saltware" else career_data[section]
                    self.assertEqual(len(items), count)
                    self.assertEqual([
                        unescape(item) for item in re.findall(r'<li>(.*?)</li>', career_section(section), re.S)
                    ], items)
            self.assertIn(career_data["saltware"]["description"], unescape(career_section("saltware")))
            self.assertEqual(career_data["teaching"][0]["status"], "예정")
            self.assertEqual(career_data["teaching"][2]["title"], "한국공학대학교")
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
                    self.assertIn(f'class="project-case case-visual brand-exhibit be-{key}"', content)
                    self.assertIn(f'data-brand-project="{key}"', content)
                    self.assertIn(f"<h1>{name}</h1>", content)
                    self.assertIn(f'<p class="be-classification"><span>{kind}</span><span>{year}</span></p>', content)
                    self.assertIn('class="be-poster" aria-hidden="true"', content)
                    self.assertIn('type="button" data-brand-scroll class="be-scroll" aria-label="작업 범위 보기"', content)
                    self.assertIn('class="be-information"', content)
                    self.assertIn(f"<dt>YEAR</dt><dd>{year}</dd>", content)
                    self.assertIn(f"<dt>TYPE</dt><dd>{kind}</dd>", content)
                    self.assertIn("<dt>DESIGNER</dt><dd>김주연 / Zoonii</dd>", content)
                    self.assertEqual(content.count('class="be-deliverable-number"'), len(scope))
                    for deliverable in scope:
                        self.assertIn(f"<strong>{deliverable}</strong>", content)
                    self.assertIn("작업 이미지 준비 중", content)
                    self.assertNotIn("IMAGE PLACEHOLDER", content)
                    self.assertNotIn("LAYOUT PREVIEW", content)
                    self.assertNotIn('class="case-section"', content)
                    self.assertNotIn('brand-dossier', content)
                    self.assertNotIn('bf-', content)
                    self.assertFalse(page["index"])
            for route in pages:
                file = root / (route.strip("/") + "/index.html" if route != "/" else "index.html")
                html = file.read_text()
                self.assertIn('/scripts/runtime/portfolio-home.js?v=', html)
                self.assertNotIn("const projects=", html)
                self.assertEqual(html.count('id="zz-structured-data"'), 1)
            (root / "career-data.js").unlink()
            missing_data = subprocess.run(
                [sys.executable, str(root / "scripts/build-seo.py")],
                check=False, capture_output=True, text=True,
            )
            self.assertNotEqual(missing_data.returncode, 0)
            self.assertIn("career-data.js", missing_data.stderr)


if __name__ == "__main__":
    unittest.main()
