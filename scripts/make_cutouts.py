"""Generate transparent product cutouts + enhanced imagery for Divine Mee.

- Jars: AI background removal (rembg/u2net), crop to subject, mild clarity boost.
- Logo: white background converted to alpha (gold brushstroke preserved exactly).
Photography is only sharpened/cleaned - labels, colors and shapes are untouched.
"""
import io
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from rembg import remove, new_session

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "public" / "images"
OUT = IMG / "cutouts"
OUT.mkdir(parents=True, exist_ok=True)

session = new_session("u2net")


def clarity(img: Image.Image) -> Image.Image:
    """Mild photographic cleanup: denoise edge halos + unsharp for label legibility."""
    img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=80, threshold=3))
    return img


def cutout(src: str, dst: str, scale: int = 2):
    path = IMG / src
    img = Image.open(path).convert("RGB")
    # Upscale before matting so edges stay crisp at large hero sizes
    if scale > 1:
        img = img.resize((img.width * scale, img.height * scale), Image.LANCZOS)
    img = clarity(img)
    result = remove(
        img,
        session=session,
        alpha_matting=False,
        post_process_mask=True,
    )
    # Crop to subject bounding box with padding
    alpha = result.getchannel("A")
    bbox = alpha.getbbox()
    if bbox:
        pad = int(0.04 * max(result.size))
        l, t, r, b = bbox
        bbox = (max(0, l - pad), max(0, t - pad), min(result.width, r + pad), min(result.height, b + pad))
        result = result.crop(bbox)
    result.save(OUT / dst, "PNG", optimize=True)
    print(f"{dst}: {result.size}")


def logo_cutout(src: str, dst: str):
    """Flat white background -> alpha. Keeps gold + black strokes intact."""
    img = Image.open(IMG / src).convert("RGB")
    img = img.resize((img.width * 2, img.height * 2), Image.LANCZOS)
    gray = ImageOps.grayscale(img)
    # Distance from white drives alpha; strokes are dark/saturated so they survive
    alpha = gray.point(lambda v: min(255, int((255 - v) * 1.6)))
    out = img.convert("RGBA")
    out.putalpha(alpha)
    bbox = alpha.getbbox()
    if bbox:
        out = out.crop(bbox)
    out.save(OUT / dst, "PNG", optimize=True)
    print(f"{dst}: {out.size}")


cutout("jar-rose.jpg", "rose-magic.png")
cutout("jar-lavender.jpg", "lavender-bliss.png")
cutout("jar-pair.jpg", "jar-pair.png")
logo_cutout("logo.jpg", "logo.png")
print("done")
