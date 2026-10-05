"""Genera miniaturas de 256 px para las cuadrículas.

Uso (desde la raíz del repo):  python tools/make_thumbs.py

Lee img/killers y img/survivors y escribe img/thumbs/<carpeta>/<nombre>.webp.
Las imágenes originales se conservan para la pantalla completa del asesino.
Requiere Pillow:  pip install pillow
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SIZE = 256
QUALITY = 82

total_in = total_out = 0
for folder in ("killers", "survivors"):
    out_dir = ROOT / "img" / "thumbs" / folder
    out_dir.mkdir(parents=True, exist_ok=True)
    for src in sorted((ROOT / "img" / folder).iterdir()):
        if src.suffix.lower() not in (".webp", ".png", ".jpg"):
            continue
        dst = out_dir / (src.stem + ".webp")
        with Image.open(src) as im:
            im = im.convert("RGBA") if im.mode in ("P", "LA") else im
            im.thumbnail((SIZE, SIZE), Image.LANCZOS)
            im.save(dst, "WEBP", quality=QUALITY, method=6)
        total_in += src.stat().st_size
        total_out += dst.stat().st_size

print(f"originales: {total_in / 1024:.0f} KB -> miniaturas: {total_out / 1024:.0f} KB")
