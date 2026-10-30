# AGENTS.md

Contributor and agent guide for `wuzzynizzy/wuzzynizzy.github.io`, Nizzy's static GitHub Pages home page and `/emoji/` reaction host.

## Architecture

`index.html`, `404.html`, `styles.css`, and `app.js` serve directly from the repository root with `.nojekyll` enabled and no build step. `styles.css` loads self-hosted Comfortaa and Quicksand WOFF2 files from `assets/fonts/` and keeps all palette colours in `:root` custom properties. Contact chips, tool pills, special-thanks pills, and the Ko-fi footer CTA render as crisp HTML/CSS pills paired with local vector SVGs in `assets/icons/*.svg` so badge text stays sharp at any DPI. Live GitHub stats render through external `<img>` endpoints (`github-readme-stats.vercel.app`, `streak-stats.demolab.com`, `github-profile-summary-cards.vercel.app`, dynamic `img.shields.io` counters at native `20px` height, and `skillicons.dev`) rather than custom stat generators. `app.js` runs initial entrance animations, a top scroll progress bar, a sliding navbar indicator (`#nav-glider`, active on phones too), hover popovers (`#hover-popover`), toast notifications (`#toast-region`), `#sticker-modal` and `#contact-modal` dialogs, `PointerEvent` sticker fling physics on desktop and mobile, section reveals, and rotating typing lines. Two motion systems sit on top of that: a sticker engine where each cat blooms in from `scale 0.22` and retires by falling past the bottom edge, and one damped spring per emoji (`[data-toy]`, sticker tiles, modal preview) that integrates position, scale and rotation from wherever the element currently is. All 88 Animal Crossing: New Horizons reaction stickers live under `emoji/*.png` so external Markdown files can hotlink `https://wuzzynizzy.github.io/wuzzynizzy/emoji/<name>.png`.

## Key invariants

- Keep the site a single-page personal home page matching `wuzzynizzy/wuzzynizzy`. Never turn it into a portfolio or add project lists.
- Never state age 19 or say Nizzy started coding at 13. Keep `6+ years of experience`, `backend dev in singapore`, `he/him`, and `gmt+8`.
- Never write the word `femboy` anywhere in text or metadata, and never list CAD, 3D modelling, or design/editing tools under skills.
- Keep `wuzzy.nizzy@gmail.com` described as read and answered by Nizzy himself. Never say or imply an AI replies for him.
- Keep zero star glyphs (`U+2605`, `U+2606`, `U+2726`, `U+2727`) on `wuzzynizzy.github.io/wuzzynizzy`; use hosted Animal Crossing reaction PNGs (`emoji/*.png`) for brand, heading, hero, and OG card accents instead.
- Keep `.site-header` centered (`justify-content: center`) and sticky (`position: sticky`) so the top navigation bar stays visible while scrolling down, with `scroll-margin-top` on section targets.
- Keep zero authored or rendered `::before` / `::after` pseudo-elements, zero `border-left` accent stripes, zero status dots, zero decorative eyebrows, and zero em dashes (`U+2014`) across all files.
- Keep all brand icons in `assets/icons/` as crisp vector `.svg` files (never low-res `.png` rasters) and never use scaled static `img.shields.io` badges outside `#stats`: `Arena AI` uses the white official mark (`assets/icons/arena.svg`), `Wispbyte` uses a capital `W` and official blue clover SVG (`assets/icons/wispbyte.svg`), `Kiro` uses `assets/icons/kiro.svg`, `Claude Code` uses `#D97757`, `VSCodium` uses `#2F80ED` (never VS Code), and `Vercel` uses `#f6e8f1`.
- Keep every `emoji/<name>.png` filename stable so hotlinks from `wuzzynizzy/wuzzynizzy` and other repos never break.
- Never remove a visible flying sticker in place. `retireActor` sets `exiting`, drops pointer capture and floor collision, and the tick loop deletes the node only after it is below `window.innerHeight + size + 48`. The active cap is `18`; bursts stagger at `35` to `45ms` per cat.
- Never reintroduce a preset wobble. `@keyframes toy-pop` and `.is-popping` are deleted on purpose. Emoji motion is the per-element spring in `app.js`, so a click during a hover, a drag or another click continues from the current state.
- Keep `scrollbar-gutter: stable` on `html` and the `clientWidth` padding compensation in `openModal()`. Together they hold `.shell` at an identical `left` value whenever a modal opens or closes.
- Keep hover transforms small and pointer-only: `scale(1.05)` to `scale(1.06)`, tilt no more than `2.5deg`, lift `1.5px`, inside `@media (hover: hover) and (pointer: fine)`. Touch screens must never keep a hover state.
- The `.brand-link > span` wordmark carries its own `translateY(1px)`. Comfortaa's ink sits high against the cat mark, and the cat carries the box centre, so the word needs the nudge to look level.
- Keep the header on one row at every width. `.brand-link`, `.site-nav a` and `.header-ping-btn` all use `height: 36px` with `line-height: 1`. Below `900px` the nav scrolls horizontally with a mask fade.
- Keep the sticky offset equal to the header's resting margin (`top: 18px` on desktop, `top: 10px` on phones). If the two numbers drift apart, the bar visibly hops as soon as the page starts scrolling.
- Keep the scrollbar hidden on every engine (`scrollbar-width: none`, `-ms-overflow-style: none`, a zero-size `::-webkit-scrollbar`). Nothing may reserve gutter space.
- `#nav-glider` marks where the reader is. It follows `aria-current` from the scroll spy or a clicked link and must never move on hover.
- Every card, chip and control is spring-driven in `app.js` (`.intro-card`, the banner, skill rows, stat cards, stack chips and the shields badges lift; buttons, pills and tiles press in). CSS must not also set `transform` on their `:hover` or `:active` rule. CSS keeps the surface answer: border, background and shadow.
- No element the spring drives may declare `transform` inside a `transition`. A transition restarts on every frame the spring writes, so the element stops moving altogether. Entrance and reveal motion therefore uses the individual `translate` and `scale` properties, which compose with `transform` instead of capturing it.
- Keep the motion small. The spring tops out around `scale(1.03)` on a control and lifts cards `3px`, with damping `26`. Larger amplitudes were tried and read as jumpy.
- The sticker inspector is for inspecting. Opening it, clicking its preview, paging it or pressing `Escape` launches no cats.
- Keep the `tile tap:` control a segmented switch with a fixed outer width. Both options keep their width, so the thumb glides on `transform` and the sibling buttons never move.
- Keep sticker-modal paging animated through `.modal-swap-body`. The whole body slides `22px` horizontally toward the direction of travel and fades to `0.1`, with no rotation and no vertical drift, while the card keeps locked dimensions. The close button sits outside that surface so it never slides away.

## Commands

```bash
# Serve locally for manual or Playwright checks
python3 -m http.server 8000

# Run the repository verification script
python3 check.py
```

## Coding conventions

- Vanilla HTML5 and CSS3 with progressive JavaScript in `app.js`. Do not add frameworks, bundlers, `package.json`, or external font CDNs.
- Keep all hex/RGB/RGBA colour literals inside `:root` in `styles.css` and reference `var(--...)` everywhere else in the stylesheet.
- Respect `prefers-reduced-motion: reduce` across CSS transitions, scroll-reveal, typing intervals, and `PointerEvent` sticker fling physics. Keep `touch-action: none` scoped only to `[data-toy]` and `.flying-sticker` so vertical mobile scrolling across `.sticker-grid` and the page body stays native.
- Keep lowercase personal voice in page copy while preserving capital `Nizzy` and proper product/technical names (`AI`, `GitHub`, `Discord`, `Ko-fi`, `Kiro`, `Arena AI`, `Claude Code`, `Wispbyte`, `VSCodium`, `Replit`, `Railway`, `Vercel`, `Cloudflare`, `APIs`).
- Use root-relative asset URLs (`/styles.css`, `/app.js`, `/emoji/...`, `/assets/...`) in `404.html` so deep-path 404s render cleanly on GitHub Pages.

## Verification

Before finishing any change:

1. Run `python3 check.py` and confirm exit code `0`.
2. Run `deslop.py` on `index.html`, `404.html`, `assets/wuzzynizzy-site-og.html`, `EMOJI-CHEATSHEET.md`, `README.md`, `AGENTS.md`, and `HANDOFF.md` and confirm `5/5 CLEAN`.
3. Render `http://127.0.0.1:8000/` and `/404.html` in headless Chromium at `320x800`, `390x844`, `768x1024`, and `1440x1000` (plus mobile touch/drag fling interaction and `prefers-reduced-motion: reduce`) and inspect screenshots for text sharpness, broken images, contrast, or horizontal overflow.
4. Assert programme behaviour, not just pixels: `.shell` `left` is unchanged when either modal opens or closes, sibling buttons in `.sticker-controls` do not move when the tile-tap mode changes, removed stickers were fully below the fold, and the nav, wordmark and `say hi` share one text-centre axis.
5. If `assets/wuzzynizzy-site-og.html` changes, re-export `assets/og-image-1200x600.png` with `repo-og-export.py` and confirm exit code `0`.

## Do not touch without asking

- Exact filenames under `emoji/*.png` (external READMEs hotlink these paths).
- Personal identity facts, contact handles (`@ni2zy`, `wuzzy.nizzy@gmail.com`, `ko-fi.com/wuzzynizzy`), and palette hex values (`#1a1016`, `#ff5fa2`, `#ff8fc7`, `#c9a7ff`, `#8fe6e2`, `#f6e8f1`).
- Font licence files in `assets/fonts/OFL.txt` and unsubsetted Reserved Font Name binaries (`comfortaa-*.woff2`, `quicksand-*.woff2`).
