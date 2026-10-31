# Draws the home-screen icons (かな/もん in the trailer's logo colours): python3 tools/make_icons.py
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
FONT = '/System/Library/Fonts/ヒラギノ丸ゴ ProN W4.ttc'
OUT = os.path.join(os.path.dirname(__file__), '..', 'icons')
os.makedirs(OUT, exist_ok=True)

def icon(size, maskable=False):
    S = 1024
    im = Image.new('RGBA', (S, S))
    d = ImageDraw.Draw(im)
    # sky → blossom gradient
    for y in range(S):
        t = y / S
        c = (int(170 + 85 * t), int(222 - 40 * t), int(255 - 50 * t))
        d.line([(0, y), (S, y)], fill=c)
    # petals
    for (x, y, r) in [(140, 170, 60), (880, 140, 48), (860, 860, 70), (150, 880, 52), (520, 90, 36)]:
        d.ellipse([x - r, y - r * .6, x + r, y + r * .6], fill=(255, 205, 222))
    pad = 150 if maskable else 70
    f = ImageFont.truetype(FONT, int((S - pad * 2) * 0.47))
    chars = [('か', (63, 179, 79)), ('な', (255, 154, 60)), ('も', (59, 143, 232)), ('ん', (255, 95, 158))]
    cell = (S - pad * 2) / 2
    for i, (ch, col) in enumerate(chars):
        cx = pad + cell * (i % 2) + cell / 2
        cy = pad + cell * (i // 2) + cell / 2
        # shadow, white outline, colour
        for dx, dy, fill, sw in [(0, 18, (90, 59, 43), 34), (0, 0, (255, 255, 255), 34), (0, 0, col, 6)]:
            d.text((cx + dx, cy + dy), ch, font=f, fill=fill, anchor='mm', stroke_width=sw, stroke_fill=fill)
    if not maskable:
        mask = Image.new('L', (S, S), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, S, S], radius=200, fill=255)
        bg = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        bg.paste(im, (0, 0), mask)
        im = bg if size != 180 else im  # iOS rounds apple-touch-icons itself
    return im.resize((size, size), Image.LANCZOS)

icon(180).convert('RGB').save(os.path.join(OUT, 'icon-180.png'))
icon(192).save(os.path.join(OUT, 'icon-192.png'))
icon(512).save(os.path.join(OUT, 'icon-512.png'))
icon(512, True).convert('RGB').save(os.path.join(OUT, 'icon-512-maskable.png'))
print('icons written')
