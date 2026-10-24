#!/usr/bin/env python3
"""Static checks for the site. No browser needed, so it cannot catch layout bugs.

    python3 check.py

Exits non-zero on any failure. Checks are grouped by what they protect: the
site's own rules first (no generated content, no accent bars, no fake copy),
then the boring structural stuff, then contrast on the real token pairs.
"""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
failures: list[str] = []
notes: list[str] = []


def fail(message: str) -> None:
    failures.append(message)


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


# ---------------------------------------------------------------- design bans

css = read("assets/style.css")
html_src = read("index.html")
notfound = read("404.html")

if re.search(r"^\s*content\s*:", css, re.M):
    fail("style.css sets `content:`. Generated content is banned on this site.")
if re.search(r"::(before|after)\s*\{[^}]*content\s*:", css):
    fail("style.css renders a pseudo-element.")
if re.search(r"border-left\s*:\s*(?!none|0)", css):
    fail("style.css has a border-left, which is the banned accent bar shape.")
if "text-transform: uppercase" in css:
    fail("style.css has an uppercase transform, the banned tracked-caps label.")
if re.search(r"\b\d+px\s*;[^}]*text-transform", css):
    fail("style.css has letter-spacing near an uppercase transform.")

for name, source in (("index.html", html_src), ("404.html", notfound)):
    if "\u2014" in source:
        fail(f"{name} contains an em dash.")
    if re.search("[\u2013\u2014\u2015]", source) and "\u2014" not in source:
        fail(f"{name} contains an en dash.")
    for word in ("lorem", "ipsum", "TODO", "TBD", "coming soon"):
        if word.lower() in source.lower():
            fail(f"{name} contains placeholder text: {word}")

if re.search(r"border-left", html_src):
    fail("index.html sets border-left inline.")

# ------------------------------------------------------------------ structure

h1s = re.findall(r"<h1[^>]*>", html_src)
if len(h1s) != 1:
    fail(f"index.html has {len(h1s)} h1 elements, expected 1.")

for name, source in (("index.html", html_src), ("404.html", notfound)):
    if "<html lang=" not in source:
        fail(f"{name} has no language attribute.")
    if 'name="viewport"' not in source:
        fail(f"{name} has no viewport tag.")
    if 'name="description"' not in source and name == "index.html":
        fail(f"{name} has no meta description.")
    for img in re.findall(r"<img\b[^>]*>", source):
        if "alt=" not in img:
            fail(f"{name} has an img without alt: {img[:60]}")
    for button in re.findall(r"<button\b[^>]*>", source):
        if 'type="button"' not in button:
            fail(f"{name} has a button without type=button: {button[:60]}")
    if 'class="skip"' not in source and name == "index.html":
        fail("index.html has no skip link.")

# anchors resolve
ids = set(re.findall(r'\bid="([^"]+)"', html_src))
for target in re.findall(r'href="#([^"]+)"', html_src):
    if target not in ids:
        fail(f"index.html links to #{target}, which has no matching id.")

# local assets exist
for ref in re.findall(r'(?:href|src)="(?!https?:|mailto:|#|/)([^"]+)"', html_src):
    if not (ROOT / ref).exists():
        fail(f"index.html references a missing file: {ref}")

for ref in re.findall(r'(?:href|src)="/([^"]+)"', notfound):
    if not (ROOT / ref).exists():
        fail(f"404.html references a missing file: /{ref}")

# fonts
for weight in (400, 500, 700):
    font = ROOT / f"assets/fonts/google-sans-{weight}.woff2"
    if not font.exists():
        fail(f"missing font file: {font.name}")
    elif font.stat().st_size < 5000:
        fail(f"{font.name} looks empty at {font.stat().st_size} bytes")
if not (ROOT / "assets/fonts/OFL.txt").exists():
    fail("the OFL licence text is missing next to the font.")

# ------------------------------------------------------------------- contrast

def luminance(hex_colour: str) -> float:
    value = hex_colour.lstrip("#")
    channels = [int(value[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    linear = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast(a: str, b: str) -> float:
    la, lb = luminance(a), luminance(b)
    lighter, darker = max(la, lb), min(la, lb)
    return (lighter + 0.05) / (darker + 0.05)


tokens = dict(re.findall(r"--([\w-]+):\s*(#[0-9a-fA-F]{6})", css))
pairs = [
    ("text on canvas", "text", "canvas", 4.5),
    ("muted on canvas", "muted", "canvas", 4.5),
    ("muted on surface", "muted", "surface", 4.5),
    ("pink on canvas", "pink", "canvas", 4.5),
    ("cyan on canvas", "cyan", "canvas", 4.5),
    ("violet on canvas", "violet", "canvas", 4.5),
    ("ink on pink button", "ink", "pink", 4.5),
    ("button border on canvas", "control", "canvas", 3.0),
    ("button border on surface", "control", "surface", 3.0),
]
for label, fg, bg, minimum in pairs:
    if fg not in tokens or bg not in tokens:
        fail(f"contrast pair {label}: missing token")
        continue
    ratio = contrast(tokens[fg], tokens[bg])
    line = f"{label}: {ratio:.2f}:1 (needs {minimum})"
    if ratio < minimum:
        fail(line)
    else:
        notes.append(line)

hairline = contrast(tokens["line"], tokens["canvas"])
notes.append(f"card hairline on canvas: {hairline:.2f}:1 (separator only, no minimum)")

# ------------------------------------------------------------------- footprint

total = sum(
    f.stat().st_size
    for f in ROOT.rglob("*")
    if f.is_file() and "node_modules" not in f.parts and ".git" not in f.parts
)
first_load = sum(
    f.stat().st_size
    for f in [ROOT / "index.html", ROOT / "assets/style.css", ROOT / "assets/app.js"]
)
font_budget = sum(f.stat().st_size for f in (ROOT / "assets/fonts").glob("*.woff2"))
notes.append(f"page total {total / 1024:.0f} KB, critical three {first_load / 1024:.0f} KB, fonts {font_budget / 1024:.0f} KB")
if total > 2 * 1024 * 1024:
    fail(f"site is {total / 1024 / 1024:.1f} MB, over the 2 MB budget")

# plain text of the page, for the copy review
text = html.unescape(re.sub(r"<[^>]+>", " ", html_src))
words = len(re.findall(r"[A-Za-z']+", text))
notes.append(f"visible words in index.html: {words}")

print("checks")
for line in notes:
    print(f"  ok   {line}")
if failures:
    print("\nfailures")
    for line in failures:
        print(f"  FAIL {line}")
    sys.exit(1)
print("\nall checks passed")
