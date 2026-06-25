from pathlib import Path
import re

html = Path(__file__).parent.joinpath("debug_detail.html").read_text(encoding="utf-8")

# Cari bagian yang mengandung kata kunci
keywords = ["tanggal", "penawaran", "penjamin", "harga", "pencatatan", "distribusi", "lembar", "warrant", "alamat"]
text = re.sub(r"<[^>]+>", " | ", html)
text = re.sub(r"\s+", " ", text)

print("=== CARI KATA KUNCI ===\n")
for kw in keywords:
    # Ambil 100 karakter sebelum dan sesudah kata kunci
    idx = text.lower().find(kw)
    if idx != -1:
        start = max(0, idx - 80)
        end = min(len(text), idx + 120)
        print(f"[{kw}]")
        print(f"  ...{text[start:end]}...\n")

# Cek apakah ada tag table di detail page
print("=== CEK TAG ===")
print(f"<table> : {html.lower().count('<table')}")
print(f"<dl>    : {html.lower().count('<dl')}")
print(f"<dt>    : {html.lower().count('<dt')}")
print(f"<th>    : {html.lower().count('<th')}")

# Cek struktur div utama
divs = re.findall(r'class="([^"]*panel[^"]*)"', html, re.IGNORECASE)
if divs:
    print(f"\nDiv panel: {set(divs[:10])}")