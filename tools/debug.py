import sys
import re
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

html_path = Path(__file__).parent / "debug_raw.html"
html = html_path.read_text(encoding="utf-8")

# Ambil semua blok data yang punya data-key
blocks = re.findall(r'<div data-key="(\d+)">(.*?)</div>\s*</div>\s*</div>\s*</div>', html, re.DOTALL)

if blocks:
    print(f"Ditemukan {len(blocks)} blok IPO.\n")
    print("=" * 50)
    print("STRUKTUR BLOK PERTAMA (RANS)")
    print("=" * 50)
    
    # Ambil blok pertama, bersihkan script/style
    first_block = blocks[0][1]
    first_block = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', first_block, flags=re.DOTALL)
    
    # Format biar mudah baca
    first_block = re.sub(r'>\s+<', '>\n<', first_block)
    
    print(first_block)
else:
    print("Tidak ada blok ditemukan. Coba cari tag lain...")
    # Fallback: cari div yang mengandung 'panel-body'
    panels = re.findall(r'(<div class="panel-body">.*?</div>\s*</div>)', html, re.DOTALL)
    if panels:
        print(f"Ditemukan {len(panels)} panel-body. Menampilkan yang pertama:")
        print(re.sub(r'>\s+<', '>\n<', panels[0])[:3000])