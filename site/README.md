# the site

Static files, one small script, no build step. Open `index.html` and it works.

```sh
python3 check.py                 # rules, structure, contrast, size
npm install --no-save jsdom      # only needed for the tests
node --test tests/widget.test.mjs
python3 -m http.server 8000      # then open http://localhost:8000
```

## What is in here

- `index.html` — one page: who I am, how the workflow goes, live GitHub numbers, what I use, the art policy, and how to reach me.
- `assets/style.css` — tokens at the top, then layout, then the four components that exist.
- `assets/app.js` — the constellation widget and the GitHub fetch. Nothing else.
- `assets/fonts/` — Google Sans, self hosted subset, three weights, OFL notice beside it. Provenance in `SOURCE.md`.
- `check.py` — the checks that do not need a browser.
- `tests/widget.test.mjs` — behaviour tests for the widget and the three stats states.

## What the checks actually cover

`check.py` fails the build on generated content in the CSS, a `border-left`, an uppercase transform, em dashes, placeholder copy, a missing skip link, a second `h1`, a broken internal anchor, a missing asset, a missing font file or licence, and contrast below 4.5:1 on any text pair or 3:1 on a control boundary. It prints the measured ratios so the numbers are visible rather than claimed.

The tests cover the parts a static scan cannot see: that stars only count in order, that a wrong star resets everything and says so, that five in order finishes, and that the stats area shows real payload numbers, an error, a rate limit message, or an empty state depending on what happens.

## What is not covered

There is no browser in the environment this was built in, so there are no screenshots, no rendered font report, no real 320/768/1440 overflow test, and no reduced-motion capture. The layout is reasoned from CSS and from the measurements in the design brief, not observed. Run it in a browser before trusting it, and treat the first look as a review, not a formality.

## Font

Google Sans from the official `google/fonts` distribution, OFL 1.1. `opsz` pinned to 18, `GRAD` pinned to 0, one static instance per weight, then subset to Basic Latin plus punctuation, arrows and a few symbols. About 37 KB per weight. The licence text ships unmodified beside the files, and `SOURCE.md` records the blob hash it came from.

Google Sans has no star or heart glyphs, which is why the stars on this page are SVG paths rather than characters. That also keeps them identical across platforms.

## Deploying

Two different addresses, and they are not interchangeable.

**`wuzzynizzy.github.io`, the address you asked for.** GitHub only serves a user site from a repository named exactly `wuzzynizzy.github.io`. Create that repository, copy the contents of this `site/` folder to its root, and enable Pages with Source set to GitHub Actions. The workflow in this repository lives at `.github/workflows/pages.yml`; copy it to the new repo's `.github/workflows/` and run it by hand.

**`wuzzynizzy.github.io/wuzzynizzy/`, the project page.** Same repository as this README, published from the `site/` folder. Enable Pages on `wuzzynizzy/wuzzynizzy` with Source set to GitHub Actions, then run the `publish site` workflow manually.

Either way, `Settings`, `Pages`, `Source: GitHub Actions` is the switch. Until that is done the workflow has nothing to deploy to, which is why it is manual dispatch only instead of failing on every push.

If the site is published under a subpath rather than at the domain root, change the two root relative paths in `404.html` (`/assets/star.svg` and the link home) to match, since a 404 is served from arbitrary depths and cannot use relative paths.
