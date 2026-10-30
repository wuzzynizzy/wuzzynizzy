# Font provenance and rebuild instructions

Retrieved on 2026-10-25 from the official `google/fonts` repository (`main` branch), all licensed under SIL Open Font License 1.1 (`OFL.txt` in this folder).

## Upstream variable / source TTF files

- `Comfortaa[wght].ttf` (`https://raw.githubusercontent.com/google/fonts/main/ofl/comfortaa/Comfortaa%5Bwght%5D.ttf`): 201,756 bytes, SHA-256 `0fc3f45dc48b614db9c39181502544b37217ecbf8bee2fb35886992bc96c5bd3`
- `Quicksand[wght].ttf` (`https://raw.githubusercontent.com/google/fonts/main/ofl/quicksand/Quicksand%5Bwght%5D.ttf`): 124,824 bytes, SHA-256 `39c9b64223561f56aaff6062a6f04063c4fc86809ad6768722c06614d977e1cc`
- `NotoSansSymbols2-Regular.ttf` (`https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssymbols2/NotoSansSymbols2-Regular.ttf`): 1,233,128 bytes, SHA-256 `7d5fb73b7ca67a6798101741f5d280a3d016a56a197afcd4199dbb57b4b82a21`

## Shipped WOFF2 files

Comfortaa and Quicksand keep their complete glyph sets (no subsetting) and are instantiated as static weights so their Reserved Font Names remain intact under SIL OFL 1.1. Noto Sans Symbols 2 has no Reserved Font Name and is subsetted to cute heart symbols (`U+2661`, `U+2665`, alongside fallback codepoints) so `♡` renders reliably on systems without a local symbol font.

- `comfortaa-600.woff2`: 39,292 bytes, SHA-256 `b89cc8d1213201472c53651eaf10def7b33c5363be349694368a227aee7b76b4`
- `comfortaa-700.woff2`: 37,580 bytes, SHA-256 `6161a55ee3adf574afeede3b1e4936932c75297a88c929885578da8e2ea5eb96`
- `quicksand-500.woff2`: 31,016 bytes, SHA-256 `367d26403025c036d0ce282d4de59501aaca05e8d8b7e57f24ffe51d8c4b7020`
- `quicksand-600.woff2`: 31,240 bytes, SHA-256 `1d6f8f04dc3e3615197dc43ce8eb7861775498c9c0501bb711661452ae7b6018`
- `noto-symbols-cute.woff2`: 3,396 bytes, SHA-256 `4b59954d18dea8acb253d6a0792c18e3a710e9367f76948c0772554b076bb46e`

## Rebuild command

```sh
pip install fonttools brotli
curl -sL "https://raw.githubusercontent.com/google/fonts/main/ofl/comfortaa/Comfortaa%5Bwght%5D.ttf" -o Comfortaa-wght.ttf
curl -sL "https://raw.githubusercontent.com/google/fonts/main/ofl/quicksand/Quicksand%5Bwght%5D.ttf" -o Quicksand-wght.ttf
curl -sL "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssymbols2/NotoSansSymbols2-Regular.ttf" -o NotoSansSymbols2-Regular.ttf

python3 - <<'PY'
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.subset import Subsetter, Options

for fam, src, weights in [
    ('comfortaa', 'Comfortaa-wght.ttf', (600, 700)),
    ('quicksand', 'Quicksand-wght.ttf', (500, 600)),
]:
    for w in weights:
        f = TTFont(src)
        inst = instantiateVariableFont(f, {'wght': w}, inplace=False, updateFontNames=True)
        inst.flavor = 'woff2'
        inst.save(f'{fam}-{w}.woff2')

f_sym = TTFont('NotoSansSymbols2-Regular.ttf')
opts = Options()
opts.flavor = 'woff2'
opts.name_IDs = ['*']
opts.notdef_outline = True
sub = Subsetter(options=opts)
sub.populate(unicodes=[0x2605, 0x2606, 0x2661, 0x2665, 0x2726, 0x2727])
sub.subset(f_sym)
f_sym.flavor = 'woff2'
f_sym.save('noto-symbols-cute.woff2')
PY
```
