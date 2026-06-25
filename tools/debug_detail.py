import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from fetch import BrowserSession
from config import LIST_URL, BASE_URL
from parser import parse_list_page, _from_table, _from_defs, _from_text

# Coba ambil 1 halaman list dulu buat dapat URL detail
bs = BrowserSession()
bs.start()

print("Mengambil halaman list...")
html_list = bs.fetch(LIST_URL, wait_for="#ipo-list")

# Baca kolom CSV
from csv_manager import read_csv
df = read_csv()
cols = list(df.columns)

ipos, _ = parse_list_page(html_list, cols)
if not ipos:
    print("Tidak ada IPO di list page.")
    sys.exit(1)

# Ambil IPO pertama yang punya detail URL
target = None
for ipo in ipos:
    if ipo.get("_detail_url"):
        target = ipo
        break

if not target:
    print("Tidak ada detail URL ditemukan.")
    sys.exit(1)

ticker = target["Ticker Code"]
url = target["_detail_url"]
if not url.startswith("http"):
    url = BASE_URL + url

print(f"Mengambil detail {ticker}: {url}")
html_detail = bs.fetch(url, wait_for=".panel-body")

# Simpan HTML mentah
debug_path = Path(__file__).parent / "debug_detail.html"
debug_path.write_text(html_detail, encoding="utf-8")
print(f"HTML disimpan ke: {debug_path}")

# Tes parser
print("\n=== HASIL PARSER ===")
r1 = _from_table(html_detail, cols)
r2 = _from_defs(html_detail, cols)
r3 = _from_text(html_detail, cols)

print(f"Dari tabel: {len(r1)} field → {list(r1.keys())}")
print(f"Dari defs: {len(r2)} field → {list(r2.keys())}")
print(f"Dari text: {len(r3)} field → {list(r3.keys())}")

if r1:
    print("\nContoh isi tabel:")
    for k, v in list(r1.items())[:5]:
        print(f"  {k}: {v}")

bs.close()