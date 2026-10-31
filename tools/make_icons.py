# Builds the home-screen icons from the painted artwork in tools/icon_source.webp (the three starters,
# made with Qwen Image like the rest of the painted art): python3 tools/make_icons.py
from PIL import Image, ImageDraw
import os
HERE = os.path.dirname(__file__)
OUT = os.path.join(HERE, '..', 'icons')
os.makedirs(OUT, exist_ok=True)
SRC = Image.open(os.path.join(HERE, 'icon_source.webp')).convert('RGB')

def icon(size, rounded=False):
    im = SRC.resize((size, size), Image.LANCZOS)
    if not rounded:
        return im  # iOS rounds apple-touch-icons itself; maskable icons are cropped by the launcher
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=round(size * 0.2), fill=255)
    out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    out.paste(im, (0, 0), mask)
    return out

icon(180).save(os.path.join(OUT, 'icon-180.png'), optimize=True)
icon(192, True).save(os.path.join(OUT, 'icon-192.png'), optimize=True)
icon(512, True).save(os.path.join(OUT, 'icon-512.png'), optimize=True)
icon(512).save(os.path.join(OUT, 'icon-512-maskable.png'), optimize=True)
print('icons written')
