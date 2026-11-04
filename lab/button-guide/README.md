# Live component inventory

Captured from https://zoonii.zip/ on 2026-11-04 (Asia/Seoul). The 42 representative specimens cover navigation, profile tabs, archive tabs/cards/windows, home artwork controls, forms/guestbook, career records, and shop components. Repeated content instances are grouped by component type.

- `catalog.json`: sanitized rendered fragments with source links; ancestor shells preserve CSS context. No scripts, CAPTCHA frames, hidden form values, or form endpoints are retained.
- `source-styles.html`: deployed stylesheet references and inline styles, in source order.
- `preview.css`: placement-only adjustments to show specimens outside their full-page layouts.
- `proposal.html`: earlier yellow capsule proposal, separate from production specimens.
- `catalog.template.html`, `catalog.css`, `catalog.js`: guide interface.

After edits, run `python3 lab/button-guide/build.py`. This regenerates a single-file `index.html` so the guide also works when a local static server caches its file list. Production images, fonts and stylesheet links still require an internet connection. The snapshots are static: the sandbox disallows scripts and form submission; use the source link for live behavior.

Validation: all 42 specimens render in the catalogue; category filtering, text search, enlarged view, and source/proposal links were checked in the browser.
