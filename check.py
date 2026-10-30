#!/usr/bin/env python3
"""Automated verification gate for wuzzynizzy/wuzzynizzy.github.io."""

from __future__ import annotations

import pathlib
import re
import struct
import sys

ROOT = pathlib.Path(__file__).resolve().parent

EXPECTED_EMOJIS = [
    "actnatural.png",
    "aggravation.png",
    "agreement.png",
    "airplane.png",
    "amazed.png",
    "apologetic.png",
    "armcircles.png",
    "armswingdance.png",
    "bashfulness.png",
    "behold.png",
    "bewilderment.png",
    "bodytwists.png",
    "coldchill.png",
    "confetti.png",
    "confident.png",
    "curiosity.png",
    "daydreaming.png",
    "delight.png",
    "disagreement.png",
    "distress.png",
    "doublewave.png",
    "dozing.png",
    "eager.png",
    "encouraging.png",
    "excited.png",
    "fearful.png",
    "feelinit.png",
    "flex.png",
    "flourish.png",
    "glee.png",
    "greeting.png",
    "grooveleft.png",
    "grooveright.png",
    "groovinghop.png",
    "happiness.png",
    "haunt.png",
    "heartbreak.png",
    "hereyougo.png",
    "hula.png",
    "inspiration.png",
    "intense.png",
    "islandstomp.png",
    "jammin.png",
    "joy.png",
    "jump.png",
    "laughter.png",
    "letsgo.png",
    "listeningears.png",
    "love.png",
    "mischief.png",
    "mistaken.png",
    "pleased.png",
    "posturewarmup.png",
    "pride.png",
    "resignation.png",
    "sadness.png",
    "saycheese.png",
    "scare.png",
    "sheepishness.png",
    "shimmy.png",
    "shocked.png",
    "showmanship.png",
    "shyness.png",
    "sidebends.png",
    "sidetoside.png",
    "sighing.png",
    "sitdown.png",
    "smirking.png",
    "sneezing.png",
    "sniffsniff.png",
    "soakitin.png",
    "sorrow.png",
    "stretch.png",
    "surprise.png",
    "tada.png",
    "takeapicture.png",
    "thought.png",
    "turnippatch.png",
    "twistydance.png",
    "upperbodycircles.png",
    "viva.png",
    "wavegoodbye.png",
    "widearmstretch.png",
    "workit.png",
    "workout.png",
    "worry.png",
    "yawn.png",
    "yoga.png",
]

REQUIRED_ICONS = [
    "assets/icons/arena.svg",
    "assets/icons/claude.svg",
    "assets/icons/cloudflare.svg",
    "assets/icons/discord.svg",
    "assets/icons/github.svg",
    "assets/icons/gmail.svg",
    "assets/icons/kiro.svg",
    "assets/icons/kofi.svg",
    "assets/icons/mullvad.svg",
    "assets/icons/protonmail.svg",
    "assets/icons/protonvpn.svg",
    "assets/icons/railway.svg",
    "assets/icons/replit.svg",
    "assets/icons/vercel.svg",
    "assets/icons/vscodium.svg",
    "assets/icons/wispbyte.svg",
]

REQUIRED_FILES = [
    ".nojekyll",
    "index.html",
    "404.html",
    "styles.css",
    "app.js",
    "EMOJI-CHEATSHEET.md",
    "README.md",
    "AGENTS.md",
    "HANDOFF.md",
    "LICENSE",
    "assets/wuzzynizzy-site-icon.png",
    "assets/wuzzynizzy-site-og.html",
    "assets/og-image-1200x600.png",
    "assets/nizzy-banner.png",
    "assets/fonts/comfortaa-600.woff2",
    "assets/fonts/comfortaa-700.woff2",
    "assets/fonts/quicksand-500.woff2",
    "assets/fonts/quicksand-600.woff2",
    "assets/fonts/noto-symbols-cute.woff2",
    "assets/fonts/OFL.txt",
    "assets/fonts/SOURCE.md",
    *REQUIRED_ICONS,
]


def png_dimensions(path: pathlib.Path) -> tuple[int, int]:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{path} is not a valid PNG")
    width, height = struct.unpack(">II", data[16:24])
    return width, height


def main() -> int:
    errors: list[str] = []

    for rel in REQUIRED_FILES:
        if not (ROOT / rel).exists():
            errors.append(f"missing required file: {rel}")

    if (ROOT / "assets/wuzzynizzy-site-icon.svg").exists():
        errors.append("legacy star SVG assets/wuzzynizzy-site-icon.svg must not exist")

    raster_icons = sorted(p.name for p in (ROOT / "assets/icons").glob("*.png"))
    if raster_icons:
        errors.append(f"assets/icons must contain crisp vector SVGs only, found PNGs: {raster_icons}")

    emoji_dir = ROOT / "emoji"
    actual_emojis = sorted(p.name for p in emoji_dir.glob("*.png")) if emoji_dir.exists() else []
    if actual_emojis != EXPECTED_EMOJIS:
        errors.append(f"emoji directory mismatch: found {len(actual_emojis)} files, expected {len(EXPECTED_EMOJIS)}")
    for name in actual_emojis:
        w, h = png_dimensions(emoji_dir / name)
        if w != h or w < 128:
            errors.append(f"emoji/{name} expected square >=128px PNG, got {w}x{h}")

    icon_png = ROOT / "assets/wuzzynizzy-site-icon.png"
    if icon_png.exists() and png_dimensions(icon_png) != (512, 512):
        errors.append(f"wuzzynizzy-site-icon.png must be 512x512, got {png_dimensions(icon_png)}")

    og_png = ROOT / "assets/og-image-1200x600.png"
    if og_png.exists() and png_dimensions(og_png) != (1200, 600):
        errors.append(f"og-image-1200x600.png must be 1200x600, got {png_dimensions(og_png)}")

    for font_rel in [
        "assets/fonts/comfortaa-600.woff2",
        "assets/fonts/comfortaa-700.woff2",
        "assets/fonts/quicksand-500.woff2",
        "assets/fonts/quicksand-600.woff2",
        "assets/fonts/noto-symbols-cute.woff2",
    ]:
        font_path = ROOT / font_rel
        if font_path.exists() and font_path.read_bytes()[:4] != b"wOF2":
            errors.append(f"{font_rel} does not start with wOF2 signature")

    css = (ROOT / "styles.css").read_text(encoding="utf-8")
    if re.search(r"::?before\b|::?after\b", css, re.I):
        errors.append("styles.css contains forbidden ::before or ::after selector")
    if "border-left" in css.lower():
        errors.append("styles.css contains forbidden border-left declaration")
    if "fonts.googleapis.com" in css or "fonts.gstatic.com" in css:
        errors.append("styles.css references external Google Fonts CDN")
    if "prefers-reduced-motion: reduce" not in css:
        errors.append("styles.css missing prefers-reduced-motion: reduce block")
    if "position: sticky" not in css or "scroll-margin-top" not in css:
        errors.append("styles.css missing sticky centered navbar or scroll-margin-top rules")
    if "overflow-x: hidden" in css:
        errors.append("styles.css uses overflow-x: hidden instead of overflow-x: clip (breaks sticky)")

    # opening a modal must not shift the centred layout sideways
    if "scrollbar-gutter: stable" not in css:
        errors.append("styles.css missing scrollbar-gutter: stable on html")

    # the scrollbar is hidden on every engine
    if "scrollbar-width: none" not in css:
        errors.append("styles.css missing scrollbar-width: none")
    if "::-webkit-scrollbar" not in css:
        errors.append("styles.css missing the WebKit scrollbar rule")

    # the sticky offset must equal the resting margin or the bar hops on scroll
    if "top: 18px" not in css or "margin: 18px auto 18px" not in css:
        errors.append("styles.css header sticky offset no longer matches its margin")

    # paging slides the whole modal body
    if ".modal-swap-body" not in css or "is-out-next" not in css:
        errors.append("styles.css missing the whole-body modal slide")

    # the wordmark carries its own optical nudge
    if "translateY(1px)" not in css:
        errors.append("styles.css missing the wordmark nudge")
    if "translate3d(-22px, 0, 0);" not in css:
        errors.append("styles.css missing the horizontal modal slide")
    for swap in ("is-out-next", "is-out-prev", "is-in-next", "is-in-prev"):
        block = css.split("." + swap, 1)[-1].split("}", 1)[0]
        if "rotate(" in block:
            errors.append(f"styles.css still tilts the modal during {swap}")

    # springs own every interactive transform, so no :active rule may set one
    for selector in (".toy-btn:active", ".modal-copy-btn:active", ".sticker-tile:active"):
        if selector in css:
            errors.append(f"styles.css still sets a transform on {selector}")

    # no selector list may mix a state selector with an unrelated element, which
    # merges two rules into one and restyles the wrong thing on press
    css_bare = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    for block in re.findall(r"([^{}]+)\{[^{}]*\}", css_bare):
        parts = [p.strip() for p in block.split(",") if p.strip()]
        if len(parts) < 2:
            continue
        states = [p for p in parts if ":active" in p or ":hover" in p]
        plain = [p for p in parts if ":active" not in p and ":hover" not in p]
        scoped = [p for p in states if p.startswith("html.")]
        if states and plain and not scoped:
            errors.append(f"styles.css has a merged selector list: {', '.join(parts)[:70]}")

    # the preset wobble is gone, springs replace it
    if "@keyframes toy-pop" in css or ".is-popping" in css:
        errors.append("styles.css still contains the removed toy-pop wobble")

    # hover motion stays small and pointer-only
    oversized = re.findall(r"scale\(1\.(?:1[0-9]|2[0-9])\)", css)
    if oversized:
        errors.append(f"styles.css still has oversized hover scales: {sorted(set(oversized))}")
    for jump in ("translate3d(0, -3px", "translate3d(0, -4px"):
        if jump in css:
            errors.append(f"styles.css still lifts by {jump}")
    if "@media (hover: hover) and (pointer: fine)" not in css:
        errors.append("styles.css missing the pointer-only hover block")

    # header row shares one control height
    if "transform: translateY(-0.5px)" not in css:
        errors.append("styles.css missing the measured say-hi optical nudge")
    if ".brand-link > span" not in css:
        errors.append("styles.css missing the brand wordmark block")

    # modal paging and copy tags animate
    if ".modal-swap" not in css or "is-out-next" not in css:
        errors.append("styles.css missing the modal swap transition")
    if ".mode-switch-thumb" not in css:
        errors.append("styles.css missing the segmented mode thumb")
    if ".media-settle" not in css:
        errors.append("styles.css missing the stat image settle transition")

    css_without_root = re.sub(r":root\s*\{[^}]*\}", "", css, count=1, flags=re.S)
    stray_hex = re.findall(r"#[0-9a-fA-F]{3,8}\b", css_without_root)
    if stray_hex:
        errors.append(f"styles.css has hex literals outside :root: {stray_hex}")

    js = (ROOT / "app.js").read_text(encoding="utf-8")
    if "prefers-reduced-motion: reduce" not in js:
        errors.append("app.js missing prefers-reduced-motion check")
    if "pointerdown" not in js or "fling-stage" not in js:
        errors.append("app.js missing PointerEvent drag-and-fling sticker physics")

    # cats bloom in and retire by dropping out of frame
    for token in ("retireActor", "exiting", "MAX_ACTIVE", "EXIT_MARGIN", "BIRTH_MS"):
        if token not in js:
            errors.append(f"app.js missing r8 physics token: {token}")
    if "removeActor" in js:
        errors.append("app.js still deletes visible stickers in place (removeActor)")
    if "toy-pop" in js or "is-popping" in js:
        errors.append("app.js still contains the removed toy-pop class toggle")

    # springs own every emoji transform
    for token in ("springFor", "springPop", "springStep", "attachEmojiSprings"):
        if token not in js:
            errors.append(f"app.js missing spring controller token: {token}")

    # modals must not shift the page and paging must animate
    if "lostGutter" not in js:
        errors.append("app.js missing scrollbar gutter compensation in openModal")
    if "modalSwapToken" not in js or "is-out-next" not in js:
        errors.append("app.js missing animated sticker modal paging")
    if "setCopyTag" not in js:
        errors.append("app.js missing tweened copy tag swap")

    # the nav pill follows the reader, never a hover
    if "hoveredNavLink" in js:
        errors.append("app.js still moves the nav glider on hover")
    if "modalSwapBody" in js or "modal-swap-body" not in js:
        errors.append("app.js missing the whole-body modal slide")

    # reaction emoji launch from the intended controls only
    if "SPRING_CONTROLS" not in js:
        errors.append("app.js missing the shared spring control selector")

    # cards share the spring language with the controls
    if "CARD_SPRING" not in js:
        errors.append("app.js missing the card spring group")

    # a tile click opens the inspector rather than launching a cat over it
    tile_click = js[js.index('tile.addEventListener("click"'):]
    tile_click = tile_click[: tile_click.index("});")]
    if "spawnSticker" in tile_click:
        errors.append("app.js still launches a cat when a sticker tile is clicked")
    if "keepActiveNavLinkVisible" not in js:
        errors.append("app.js missing mobile nav auto-scroll")

    index_html = (ROOT / "index.html").read_text(encoding="utf-8")
    notfound_html = (ROOT / "404.html").read_text(encoding="utf-8")
    og_html = (ROOT / "assets/wuzzynizzy-site-og.html").read_text(encoding="utf-8")
    cheatsheet = (ROOT / "EMOJI-CHEATSHEET.md").read_text(encoding="utf-8")

    star_chars = ("\u2605", "\u2606", "\u2726", "\u2727")
    for rel, content in [
        ("index.html", index_html),
        ("404.html", notfound_html),
        ("assets/wuzzynizzy-site-og.html", og_html),
        ("styles.css", css),
        ("app.js", js),
    ]:
        if any(ch in content for ch in star_chars):
            errors.append(f"{rel} contains a star glyph")

    required_meta = [
        'rel="canonical"',
        'property="og:site_name"',
        'property="og:type"',
        'property="og:url"',
        'property="og:title"',
        'property="og:description"',
        'property="og:image"',
        'property="og:image:width"',
        'property="og:image:height"',
        'property="og:image:alt"',
        'name="twitter:card"',
        'name="twitter:title"',
        'name="twitter:description"',
        'name="twitter:image"',
        'name="twitter:image:alt"',
    ]
    for label, html_doc in [("index.html", index_html), ("404.html", notfound_html)]:
        if re.search(r"::?before\b|::?after\b|\bbefore:", html_doc, re.I):
            errors.append(f"{label} contains pseudo-element syntax")
        if "fonts.googleapis.com" in html_doc:
            errors.append(f"{label} references external Google Fonts CDN")
        for m in required_meta:
            if m not in html_doc:
                errors.append(f"{label} missing metadata attribute {m}")
        for img_tag in re.findall(r"<img\b[^>]*>", html_doc):
            if "alt=" not in img_tag:
                errors.append(f"{label} has <img> without alt attribute: {img_tag[:80]}")
        for svg_tag in re.findall(r"<svg\b[^>]*>", html_doc):
            if "width=" not in svg_tag or "height=" not in svg_tag:
                errors.append(f"{label} has <svg> without explicit width/height attributes: {svg_tag[:80]}")

    for name in EXPECTED_EMOJIS:
        if f"emoji/{name}" not in index_html:
            errors.append(f"index.html missing emoji/{name}")
        if f"https://wuzzynizzy.github.io/wuzzynizzy/emoji/{name}" not in cheatsheet:
            errors.append(f"EMOJI-CHEATSHEET.md missing hotlink for {name}")

    required_tokens = [
        "Nizzy",
        "backend dev in singapore",
        "he/him",
        "gmt+8",
        "6+ years of experience",
        "AI apps",
        "AI workflows",
        "i reply myself",
        "@ni2zy",
        "https://discord.com/users/503214392016502815",
        "wuzzy.nizzy@gmail.com",
        "https://ko-fi.com/wuzzynizzy/",
        "Arena AI",
        "Wispbyte",
        "Discord @ni2zy",
        "GitHub wuzzynizzy",
        "VSCodium",
        "styles.css?v=r14",
        "app.js?v=r14",
        'id="sticker-modal"',
        'id="contact-modal"',
        'id="toast-region"',
        'id="hover-popover"',
        'id="scroll-progress-bar"',
        "assets/icons/arena.svg",
        "assets/icons/wispbyte.svg",
        "assets/icons/kiro.svg",
        "assets/icons/vercel.svg",
        "bg_color=00000000",
        "https://wuzzynizzy.github.io/wuzzynizzy/assets/og-image-1200x600.png",
        "last touched 30 October 2026",
        'id="fling-stage"',
        "data-toy=",
    ]

    # surface
    r8_tokens = [
        'class="stack-grid"',
        'class="mode-switch"',
        'data-mode="popup"',
        'data-mode="copy"',
        'class="mode-switch-thumb"',
        'class="modal-swap-body"',
        'modal-close',
        "skillicons.dev/icons?i=",
    ]
    for tok in r8_tokens:
        if tok not in index_html:
            errors.append(f"index.html missing r8 token: {tok}")

    stack_items = index_html.count('class="stack-item"')
    if stack_items != 13:
        errors.append(f"index.html must have 13 individual stack items, found {stack_items}")

    # the clear-cats control is gone for good
    for banned in ("data-clear-toys", "toy-btn-clear", "clear cats", "clearAllActors"):
        if banned in index_html:
            errors.append(f"index.html still contains removed control: {banned}")
        if banned in js:
            errors.append(f"app.js still contains removed control: {banned}")
    if 'id="hero-toss-btn"' not in index_html:
        errors.append("index.html lost the hero toss control")
    if 'id="burst-btn"' not in index_html:
        errors.append("index.html lost the burst control")
    for tok in required_tokens:
        if tok not in index_html:
            errors.append(f"index.html missing required token: {tok}")

    if "<span>Arena</span>" in index_html:
        errors.append("index.html uses 'Arena' instead of 'Arena AI'")
    if "<span>wispbyte</span>" in index_html:
        errors.append("index.html uses lowercase 'wispbyte' instead of 'Wispbyte'")

    shields_outside_stats = re.sub(
        r'<div class="shields-stats">.*?</div>', "", index_html, flags=re.S
    )
    if "img.shields.io" in shields_outside_stats:
        errors.append("index.html contains blurry static img.shields.io badges outside #stats")

    for og_tok in ["AI apps", "AI workflows", "by Nizzy", "88 hosted /emoji/ PNGs"]:
        if og_tok not in og_html:
            errors.append(f"assets/wuzzynizzy-site-og.html missing required token: {og_tok}")

    claude_svg = (ROOT / "assets/icons/claude.svg").read_text(encoding="utf-8")
    if "#d97757" not in claude_svg.lower():
        errors.append("assets/icons/claude.svg missing required #D97757 colour")

    vercel_svg = (ROOT / "assets/icons/vercel.svg").read_text(encoding="utf-8")
    if "#f6e8f1" not in vercel_svg.lower():
        errors.append("assets/icons/vercel.svg missing required #f6e8f1 colour")

    vscodium_svg = (ROOT / "assets/icons/vscodium.svg").read_text(encoding="utf-8")
    if "#2f80ed" not in vscodium_svg.lower():
        errors.append("assets/icons/vscodium.svg missing required #2F80ED colour")

    arena_svg = (ROOT / "assets/icons/arena.svg").read_text(encoding="utf-8")
    if 'viewBox="0 -21.5 167 167"' not in arena_svg or "#ffffff" not in arena_svg.lower():
        errors.append("assets/icons/arena.svg does not match uploaded white Arena AI mark")

    wispbyte_svg = (ROOT / "assets/icons/wispbyte.svg").read_text(encoding="utf-8")
    if 'viewBox="0 0 1554.24 1555.09"' not in wispbyte_svg:
        errors.append("assets/icons/wispbyte.svg does not match official vector mark")

    authored_files = [
        "index.html",
        "404.html",
        "styles.css",
        "app.js",
        "assets/wuzzynizzy-site-og.html",
        "EMOJI-CHEATSHEET.md",
        "README.md",
        "AGENTS.md",
        "HANDOFF.md",
    ]
    em_entity = "&" + "mdash;"
    en_entity = "&" + "ndash;"
    em_num = "&#" + "8212;"
    for rel in authored_files:
        text = (ROOT / rel).read_text(encoding="utf-8")
        if "\u2014" in text or em_entity in text or em_num in text:
            errors.append(f"{rel} contains an em dash")
        if "\u2013" in text or en_entity in text:
            errors.append(f"{rel} contains an en dash")
        if any(ch in text for ch in ("\u2018", "\u2019", "\u201c", "\u201d")):
            errors.append(f"{rel} contains curly quotes")

    for page_rel in ["index.html", "404.html", "assets/wuzzynizzy-site-og.html"]:
        low = (ROOT / page_rel).read_text(encoding="utf-8").lower()
        if "femboy" in low:
            errors.append(f"{page_rel} mentions forbidden word 'femboy'")
        if re.search(r"\b(19\s*y/?o|age\s*19|19-year-old|started\s+at\s+13)\b", low):
            errors.append(f"{page_rel} states forbidden age claim")
        if re.search(r"\b(autocad|solidworks|blender|photoshop|figma|premiere)\b", low):
            errors.append(f"{page_rel} lists non-coding CAD/design tools")
        if "vs code" in low or "vscode" in low:
            errors.append(f"{page_rel} references VS Code instead of VSCodium")

    for doc_rel in ["README.md", "AGENTS.md", "HANDOFF.md"]:
        doc = (ROOT / doc_rel).read_text(encoding="utf-8")
        if "<!--" in doc or "<project>" in doc or "YYYY-MM-DD" in doc:
            errors.append(f"{doc_rel} contains leftover template placeholder or HTML comment")

    if errors:
        for err in errors:
            print(f"FAIL: {err}", file=sys.stderr)
        return 1

    print(
        f"PASS: verified {len(REQUIRED_FILES)} core files, {len(actual_emojis)} emojis, "
        f"{len(REQUIRED_ICONS)} vector SVG icons, zero blurry static badges, Arena AI + Wispbyte, "
        "bloom-in fly-out sticker physics, custom emoji springs, zero clear buttons, "
        "zero stars, AI bio/skills/OG copy, sticky centered navbar, stable modal gutter, "
        "13 animated stack chips, segmented tile-tap switch, whole-body modal paging, "
        "hidden scrollbar, spring-driven cards and controls, "
        "PNG dimensions, WOFF2 signatures, CSS/HTML bans, and copy invariants."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
