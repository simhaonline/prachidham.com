#!/usr/bin/env python3
"""Derive all Prachi Dham icons from the supplied logo; never modify the source."""
from base64 import b64encode
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

root = Path(__file__).resolve().parents[1] / 'apps' / 'web' / 'public'
logo = Image.open(root / 'brand' / 'logo.png').convert('RGBA')
cream = (247, 245, 239, 255)


def padded(size: int, maximum_logo: int) -> Image.Image:
    background = Image.new('RGBA', (size, size), cream)
    # contain() preserves the complete original; maximum_logo<=314 prevents upscaling it.
    mark = ImageOps.contain(logo, (maximum_logo, maximum_logo), Image.Resampling.LANCZOS)
    background.alpha_composite(mark, ((size - mark.width) // 2, (size - mark.height) // 2))
    return background.convert('RGB')


padded(180, 166).save(root / 'apple-touch-icon.png', optimize=True)
padded(192, 174).save(root / 'icon-192.png', optimize=True)
padded(512, 314).save(root / 'icon-512.png', optimize=True)

# The full circular seal becomes illegible at 16px; use its existing central tree for small favicons.
tree = logo.crop((45, 56, 255, 266))
icon = Image.new('RGBA', (256, 256), cream)
inner = ImageOps.contain(tree, (225, 225), Image.Resampling.LANCZOS)
mask = Image.new('L', (225, 225), 0)
ImageDraw.Draw(mask).ellipse((0, 0, 224, 224), fill=255)
icon.paste(inner, ((256 - inner.width) // 2, (256 - inner.height) // 2), mask)
icon.save(root / 'favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])

buffer = BytesIO()
icon.resize((64, 64), Image.Resampling.LANCZOS).save(buffer, format='PNG', optimize=True)
data = b64encode(buffer.getvalue()).decode('ascii')
(root / 'favicon.svg').write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Prachi Dham Foundation icon">'
    f'<image x="0" y="0" width="64" height="64" href="data:image/png;base64,{data}" />'
    '</svg>\n', encoding='utf-8')
print('Generated favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png and icon-512.png')
