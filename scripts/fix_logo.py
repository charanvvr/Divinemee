"""Logo cutout via white-matte un-premultiply: recovers true stroke colors."""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "public" / "images"

img = Image.open(IMG / "logo.jpg").convert("RGB")
img = img.resize((img.width * 2, img.height * 2), Image.LANCZOS)
arr = np.asarray(img).astype(np.float32) / 255.0

# alpha = how far the pixel is from pure white (max over channels)
alpha = (1.0 - arr.min(axis=2)).clip(0, 1)
alpha = np.clip(alpha * 1.15, 0, 1)  # slight boost so gold reads solid

# Un-premultiply against white: c_true = (c - (1-a)) / a
a = alpha[..., None]
with np.errstate(divide="ignore", invalid="ignore"):
    true_col = np.where(a > 0.02, (arr - (1.0 - a)) / np.maximum(a, 1e-6), 0.0)
true_col = true_col.clip(0, 1)

out = np.dstack([true_col, alpha])
out_img = Image.fromarray((out * 255).astype(np.uint8), "RGBA")
bbox = out_img.getchannel("A").point(lambda v: 255 if v > 10 else 0).getbbox()
if bbox:
    out_img = out_img.crop(bbox)
out_img.save(IMG / "cutouts" / "logo.png", "PNG", optimize=True)
print("logo.png", out_img.size)
