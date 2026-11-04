# Test room

Open `/lab/` from the site root. This is an experimental index, excluded from search indexing and the production sitemap.

- `button-guide/`: self-contained button style guide.
- Game card: opens the existing local game at `http://127.0.0.1:8090/thingthingclub/` in a new tab. The existing server must remain running; its local leaderboard stays there. This branch does not migrate or deploy that server.
- Add entries in `pages.js`. A deployed test can replace the game's `href`; set `local: false` when it no longer needs the local server.
- Serve through HTTP because `lab.js` uses ES modules. From the repository root: `python3 -m http.server 8080 --bind 127.0.0.1`.

The portfolio's existing pages and publication configuration are not changed.
