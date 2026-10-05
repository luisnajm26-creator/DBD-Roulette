"""Añade ?v=<hash> a los CSS y JS enlazados en index.html.

GitHub Pages sirve los archivos con Cache-Control: max-age=600, así que sin esto
los navegadores pueden seguir usando una versión vieja hasta 10 minutos después
de publicar. El hash cambia solo cuando cambia el contenido del archivo.

Uso (desde la raíz del repo, antes de cada commit):  python tools/stamp.py
"""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
LINK = re.compile(r'((?:href|src)=")((?:css|js|data)/[^"?]+)(?:\?v=[0-9a-f]+)?(")')

def short_hash(path: Path) -> str:
    return hashlib.sha1(path.read_bytes()).hexdigest()[:8]

def stamp(match):
    prefix, rel, suffix = match.groups()
    return f"{prefix}{rel}?v={short_hash(ROOT / rel)}{suffix}"

html = INDEX.read_text(encoding="utf-8")
new = LINK.sub(stamp, html)
if new != html:
    INDEX.write_text(new, encoding="utf-8", newline="\n")
    print("index.html actualizado")
else:
    print("index.html ya estaba al día")
