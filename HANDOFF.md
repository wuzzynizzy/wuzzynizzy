# HANDOFF.md

Last updated: 2026-10-30 23:40 (Asia/Singapore, GMT+8)

## Current state

`wuzzynizzy/wuzzynizzy` (revision 14) is live at https://wuzzynizzy.github.io/wuzzynizzy/, served by GitHub Pages from `main` at the repository root. Revision 14 is the move to the wuzzynizzy account, a restraint pass on the motion, and the fixes below. Cache busting is `?v=r14`.

## What shipped in revision 14

- Identity. `Niz2y` is gone from the document, the cards and the metadata. Stats, streak and summary cards query `wuzzynizzy`, canonical and OG URLs point at `https://wuzzynizzy.github.io/wuzzynizzy/`, and the icon and OG source are `wuzzynizzy-site-icon.png` and `wuzzynizzy-site-og.html`. Ko-fi is `https://ko-fi.com/wuzzynizzy/` and the address is `wuzzy.nizzy@gmail.com`.
- Physics. A grabbed sticker used to straighten itself the moment the pointer paused, because the drag tilt came from the frame delta. Rotation now follows the hand from the angle it was grabbed at and stays there. Landed stickers used to spin upright on the floor, since the resting branch multiplied the angle toward zero every frame; they now keep the angle they landed at and only ease back inside a 26 degree rest tilt.
- Motion. The entrance was `540ms` of spring easing with a scale; it is a `300ms` fade and a `12px` rise, with the stagger capped at `180ms`. The modal opens from `10px` at `0.985` over `220ms`, and the toast rises `8px` and leaves in `140ms`. The overshoot curve stays on the stickers and is gone from the chrome. The click ring that pulsed on every control is deleted.
- Restraint. Only the surfaces that lead somewhere answer a hover. Decorative images and the stat cards stopped lifting, inline cats keep their press spring without the hover grow, the modal preview is a picture rather than a button, and tooltips fire only on the stickers you can fling and the toss controls.
- Toasts. A third toast used to delete the oldest child outright, mid-animation. The oldest plays its own exit first, then leaves.
- Cards. `rank_icon=octocat` is not a value that renderer accepts, the streak card declared `sideLabels` twice, and the three summary cards were locked to a blue theme. All four are corrected. If a card fails, the same numbers are read from `api.github.com` and shown in its place, cached for ten minutes, and a failed icon hides instead of showing a broken box.
- Loading. 33 more images got `loading="lazy"`, `decoding="async"` covers all 143 lazy images, the six remote stat cards carry intrinsic dimensions, and three preconnects warm the card hosts. Every lazy image fades in when it lands, skipped under `prefers-reduced-motion`.
- Mobile. The modal sheet and the body use `100svh` where supported, `overscroll-behavior: contain` keeps a flick inside the sheet, the sticker grid drops to `96px` columns under `400px`, tiles keep a `56px` thumb target, and long hotlinks wrap.
- Copy. Four lines edited after a SlopMonster pass, plus two of the nine heart and `:3` sign-offs dropped so the rhythm is not uniform.
- Scored. `python3 tools/deslop.py` from SlopMonster reports `5/5 CLEAN` on `index.html`, `404.html`, `README.md`, `AGENTS.md` and `HANDOFF.md`. `python3 check.py` passes.

## What shipped in revision 12

- Comments. Every essay comment in `styles.css`, `app.js`, `index.html` and `check.py` was replaced by a short marker (`/* stack */`, `/* toast stack */`, `/* modals */`) or a single line of fact. The numbered `0.` to `8.` section log in `app.js` is gone, and so are the sentences about design intent.
- Markup. All 446 tags in the two documents now share one attribute order: `class`, `id`, `href`, `src`, `type`, `width`, `height`, `alt`, `role`, `aria-*`, `loading`, `decoding`, `data-*`. Reordering is cosmetic only and was verified by a byte count and a screenshot match.
- CSS. Removed three dead rules (`.toy-btn-clear`, `.stack-box.is-settled`, `.stack-item.is-active`) and merged four groups of identical rule bodies into single grouped selectors. `styles.css` went from 45,231 to about 42,700 bytes.
- JavaScript. The four `getBoundingClientRect` and `offsetTop` reads that ran inside the scroll frame were measured once and cached, refreshed on resize and load. The scroll spy now bails out when the active section has not changed, and the glider skips its own update when it is already on the right link. The four duplicated pointer-capture try/catch blocks became two guarded helpers.
- Images. All 88 reaction PNGs and the three brand PNGs were re-encoded as 256-colour palette files. Quality was checked by PSNR against the originals composited on the page background, and nothing shipped below 38dB. The emoji folder went from 1,902,578 to 573,276 bytes, the brand PNGs from 149,155 to 43,768.
- Fonts. The four text faces were subset to the characters the site actually uses (`U+0020-007E`, the middle dot and the two heart glyphs), keeping kerning and ligatures. 142,524 to 33,524 bytes across the folder.
- Loading. Every lazy image now also carries `decoding="async"`, the banner is preloaded with high fetch priority, so the first screen paints sooner.
- Measured on the same local server: total transfer for a full page 2,229,495 to 779,660 bytes, decoded body 1,743,025 to 608,515, CSS rules 202 to 199, `DOMContentLoaded` 512 to 414ms.

## What shipped in revision 11

- Sticker-modal paging is a plain horizontal slide now. `.modal-swap-body` moves `22px` left or right depending on the direction you page, fades to `0.1` at the far end, and comes back in from the other side. The `rotate()` and `transform-origin` are gone, so there is no tilt and no vertical drift.
- `check.py` fails if any of the four swap states declares a `rotate()`.

## What shipped in revision 10

- Repaired three merged rules from a revision 9 sweep. `html.js-ready .reveal.is-visible .tool-pill:active` had fused onto `.tool-icon`, so pressing a tool pill resized it to an icon. `.btn:active` had fused onto `.btn-primary`, so pressing any button repainted it as the primary surface. `.thanks-pill:active` had fused onto `.sticker-Lead`, so pressing a thanks pill moved the sticker caption. `check.py` now fails on any selector list that mixes a state selector with a selector for a different element.
- Stopped CSS from fighting the spring. The global `a` rule and several card rules declared `transform` inside a `transition`. A transition restarts on every frame the spring writes, so those elements computed an identity transform no matter what the spring asked for, which is why cards and chips looked dead. Entrance and reveal motion now use the individual `translate` and `scale` properties, and every spring-driven element dropped `transform` from its transition list.
- Turned the motion down. Hover is `scale(1.03)` with a `1deg` tilt instead of `1.06` and `3.5deg`. Press is `0.97` instead of `0.93`. The release no longer adds randomised sideways and rotational energy. Damping went from `21` to `26`. The modal turn went from `34px` and `1.4deg` to `22px` and `0.8deg`. Hover shadows came down from `0 10px 22px` to `0 6px 16px`, and icon tilts from `1.1` and `4deg` to `1.05` and `2deg`.
- Gave the cards the same spring as the controls. `.intro-card`, `.banner-wrap`, `.skill-item`, `.stat-card`, `.streak-card`, `.stack-item`, the radical trio and the shields badges lift `3px` on hover and press in slightly, with the matching border and shadow surface. Nav links joined the spring as well.
- The wordmark now carries `translateY(1px)` on `.brand-link > span`, which puts the Comfortaa ink level with the cat mark instead of above it.
- A resting spring now clears its inline transform instead of pinning an identity matrix, so elements go back to whatever CSS wants after motion ends.
- `check.py` gates the wordmark nudge, the card spring group, and the merged-selector rule. Cache token is `?v=r10`.

## Verified

Verified on 2026-10-25:

- `python3 check.py`: `exit 0`.
- `deslop.py` (`SlopMonster`): `5/5 CLEAN` on all seven authored files. The tool scores visible prose, so `index.html`, `404.html`, `README.md`, `AGENTS.md` and `HANDOFF.md` are fed directly, and `styles.css` and `app.js` are scored on their comment prose, which is the only human-readable copy in a stylesheet or a script.
- Playwright Chromium, `qa-r11.py`: **68 checks, 0 failed** at `320x800`, `390x844`, `430x932`, `768x1024`, `1440x1000`, mobile touch and `prefers-reduced-motion: reduce`. Measured: header at `18.00px` across eight scroll positions, `clientWidth === innerWidth` at every width, `.shell` left unchanged at `310` on both modal opens and the close, zero cats after a tile click, modal body peak offset `22.0px` with `0.00deg` of rotation, `0.00px` of vertical drift and minimum opacity `0.10`, settling back to `1`, nav pill static on hover and moving on scroll and click, brand `+1.00` for the deliberate nudge and `say hi` `-0.50` against the nav axis, all header controls `36px`, mode-switch siblings `439 -> 439`, five cards each lifting `3px` on hover, a control whose computed transition carries no `transform`, a pressed tool pill keeping its box, a pressed secondary button staying off the primary surface, and a pressed thanks pill leaving the sticker shelf alone.
- Retina screenshots reviewed by eye at `device_scale_factor=2` and `6`: the load entrance mid-flight and settled, the wordmark at 6x before and after the nudge, a hovered skill card, and the sticker grid after the palette rewrite at display size.
- Fonts verified as still rendering: `document.fonts.check` returns true for all four text faces after subsetting, and all five faces report `loaded`.
- Palette rewrite spot-checked at 2x: reaction stickers at 34px show no banding, and PSNR stays at or above 38dB against the originals.

## Unverified

- Live `https://wuzzynizzy.github.io/wuzzynizzy/` and `https://wuzzynizzy.github.io/wuzzynizzy/emoji/<name>.png` still return 404 until `wuzzynizzy/wuzzynizzy.github.io` exists and Pages is enabled on `main` / root.
- Nothing has run on a real iOS or Android device, only emulated touch viewports with `has_touch` and `is_mobile`.
- The spring constants (`stiffness 240`, `damping 26`) were tuned against headless Chromium frames. A 120Hz display was not tested.
- The individual `translate` and `scale` properties need Chrome 104, Safari 14.1 and Firefox 72. Older browsers fall back to no entrance motion, which is a graceful loss rather than a broken layout.
- The subset fonts cover the characters used today. A new glyph outside `U+0020-007E`, the middle dot or the hearts would fall back to a system face until the subset is rebuilt.

## Gaps nobody has closed

- `skillicons.dev` icons are third-party images. Without that service the chips keep their labels and boxes but show no icon, and no local fallback set exists.
- `#stats` depends on `github-readme-stats`, `streak-stats`, `github-profile-summary-cards` and `img.shields.io`. Each image settles through a `4s` fallback, but the numbers are whatever those services return.
- The hidden scrollbar means there is no drag affordance on desktop. Scrolling relies on the wheel, trackpad, keyboard and touch.

## Open work

- Create public repository `wuzzynizzy/wuzzynizzy.github.io`, push this tree to `main`, and enable GitHub Pages from `main` / `/ (root)`.
- Push `niz2y-profile-ready-2026-10-25-r17.zip` to `wuzzynizzy/wuzzynizzy` once desired, then hotlink the 88 `/emoji/<name>.png` stickers from other repos.

## Known gotchas

- Keep `overflow-x: clip` (not `overflow-x: hidden`) on `body`. `overflow-x: hidden` can turn `body` into a scroll container and break `position: sticky` on `.site-header`.
- Keep `touch-action: none` scoped to `[data-toy]` and `.flying-sticker` only, so dragging a cat works without blocking finger scrolling elsewhere.
- Keep the sticky `top` equal to the header's vertical margin. Any mismatch reintroduces the scroll flick.
- Every card, chip and control takes its transform from `app.js`. A `transform` in a CSS `:hover` or `:active` rule for one of those selectors fights the spring. The dangerous case is `transition`: it looks harmless and stops all motion on that element.
- Entrance and reveal motion uses `translate` and `scale`, never `transform`, so the two systems stay in separate channels.
- Keep the spring amplitudes small. Anything past about `1.05` scale or `4px` of lift starts to read as jumpy rather than tactile.
- `.modal-swap-body` must stay a single wrapper and must translate only. Splitting the title out of it brings back the three-label slide, and adding rotation brings back the tilt that was removed on request.
- `check.py` fails on `hoveredNavLink` and on merged selector lists. Both are deliberate.
