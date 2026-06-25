"""
IPOHub Updater — Production Ready
=================================
Cukup jalankan:  python tools/update_ipo.py
"""

import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from config import (
    LIST_URL, BASE_URL, RATE_LIMIT, CSV_PATH,
    DEBUG_DIR, PROGRESS_FILE,
)
from fetch import BrowserSession
from parser import parse_list_page, parse_detail_page
from csv_manager import read_csv, validate, backup, write_csv
from updater import merge, get_existing_map, needs_detail

SEP = "=" * 50
META_KEYS = {"_detail_url", "_logo_url", "_data_key", "_prospektus"}


# ============================================================
# PROGRESS (resume)
# ============================================================
def load_progress():
    if PROGRESS_FILE.exists():
        t = PROGRESS_FILE.read_text(encoding="utf-8").strip()
        return set(t.split("\n")) if t else set()
    return set()


def save_progress(tickers):
    PROGRESS_FILE.write_text("\n".join(sorted(tickers)), encoding="utf-8")


def clear_progress():
    if PROGRESS_FILE.exists():
        PROGRESS_FILE.unlink()


# ============================================================
# DEBUG (auto-detect HTML change)
# ============================================================
def save_debug(filename, content):
    DEBUG_DIR.mkdir(parents=True, exist_ok=True)
    p = DEBUG_DIR / filename
    if isinstance(content, str):
        p.write_text(content, encoding="utf-8")
    else:
        content.save(str(p))
    return p


# ============================================================
# MAIN
# ============================================================
def main():
    force = "--force" in sys.argv
    print(SEP)
    print("IPOHub Updater")
    print(SEP)

    # ---- 1. Baca CSV ----
    print("✔ Membaca CSV...", end="\r")
    try:
        old_df = read_csv()
        expected = list(old_df.columns)
        col_set = set(expected)
        print(f"✔ Membaca CSV...")
        print(f"✔ {len(old_df)} IPO ditemukan")
    except FileNotFoundError:
        print(f"✖ CSV tidak ditemukan: {CSV_PATH}")
        sys.exit(1)
    except Exception as e:
        print(f"✖ Gagal baca CSV: {e}")
        sys.exit(1)

    if not validate(old_df, expected):
        print("✖ Struktur CSV tidak valid. Dibatalkan.")
        sys.exit(1)

    existing = get_existing_map(old_df)

    # ---- 2. Buka browser ----
    print("✔ Membuka browser...", end="\r")
    try:
        bs = BrowserSession()
        bs.start()
        print("✔ Membuka browser...")
    except Exception as e:
        print(f"✖ Gagal buka browser: {e}")
        print("  Pastikan Playwright terinstall:")
        print("    pip install playwright && python -m playwright install chromium")
        sys.exit(1)

    # ---- 3. Fetch halaman 1 ----
    print("✔ Menghubungi e-IPO...", end="\r")
    try:
        html_p1 = bs.fetch(LIST_URL, wait_for="#ipo-list")
        save_debug("page.html", html_p1)
        print("✔ Menghubungi e-IPO...")
        print("✔ Berhasil")
    except Exception as e:
        print(f"✖ Gagal: {e}")
        bs.close()
        sys.exit(1)

    # ---- 4. Parse halaman 1, dapatkan total halaman ----
    try:
        ipos_p1, last_page = parse_list_page(html_p1, expected)
    except Exception as e:
        print(f"✖ Gagal parse halaman 1: {e}")
        save_debug("error.html", html_p1)
        bs.screenshot(LIST_URL, DEBUG_DIR / "screenshot.png")
        bs.close()
        print("  Debug disimpan ke debug/")
        sys.exit(1)

    if last_page < 1:
        print("✖ Tidak bisa mendeteksi jumlah halaman.")
        bs.close()
        sys.exit(1)

    print(f"✔ Total {last_page} halaman di website")

    # ---- 5. Fetch halaman 2..N ----
    all_list_ipos = list(ipos_p1)

    if last_page > 1:
        print(f"✔ Membaca halaman 2-{last_page}...")
        for pg in range(2, last_page + 1):
            url = f"{LIST_URL}&page={pg}"
            try:
                html = bs.fetch(url, wait_for="#ipo-list")
                ipos, lp = parse_list_page(html, expected)
                all_list_ipos.extend(ipos)
                print(f"  ✔ Halaman {pg}/{last_page} — {len(ipos)} IPO")
            except Exception as e:
                print(f"  ✖ Halaman {pg} gagal: {e}")
                save_debug(f"error_page_{pg}.html", html if 'html' in dir() else "(gagal fetch)")
                continue
            time.sleep(RATE_LIMIT)

    print(f"✔ Total {len(all_list_ipos)} IPO dari website")

    if not all_list_ipos:
        print("✖ Tidak ada data yang berhasil di-parse.")
        bs.close()
        sys.exit(1)

    # ---- 6. Tentukan mana yang perlu detail page ----
    need_detail = []
    skip_detail = []

    for ipo in all_list_ipos:
        ticker = ipo.get("Ticker Code", "")
        if not ticker:
            continue

        if ticker in existing:
            old = existing[ticker]
            if force or needs_detail(ipo, old):
                need_detail.append(ipo)
            else:
                skip_detail.append(ipo)
        else:
            need_detail.append(ipo)

    print(f"✔ {len(need_detail)} perlu detail page, {len(skip_detail)} tidak berubah")

    # ---- 7. Resume check ----
    progress = load_progress() if not force else set()
    if progress:
        print(f"✔ Melanjutkan, {len(progress)} sudah diproses")

    # ---- 8. Fetch detail pages ----
    detail_results = {}
    total_nd = len(need_detail)

    if total_nd > 0:
        print(f"✔ Membuka {total_nd} halaman detail...")
        for i, ipo in enumerate(need_detail, 1):
            ticker = ipo["Ticker Code"]
            detail_url = ipo.get("_detail_url", "")

            if not detail_url:
                continue
            if ticker in progress:
                continue

            full_url = detail_url if detail_url.startswith("http") else f"{BASE_URL}{detail_url}"

            try:
                html = bs.fetch(full_url, wait_for=".panel-body")
                parsed = parse_detail_page(html, expected)
                detail_results[ticker] = parsed
                progress.add(ticker)
                save_progress(progress)
                bar = f"  [{i}/{total_nd}]"
                print(f"{bar} ✔ {ticker}")
            except Exception as e:
                print(f"  [{i}/{total_nd}] ⚠ {ticker}: {e}")
                try:
                    bs.screenshot(full_url, DEBUG_DIR / f"error_{ticker}.png")
                except Exception:
                    pass

            time.sleep(RATE_LIMIT)

    clear_progress()
    bs.close()

    # ---- 9. Merge detail data ke list ipos ----
    for ipo in all_list_ipos:
        ticker = ipo.get("Ticker Code", "")
        if ticker in detail_results:
            det = detail_results[ticker]
            for k, v in det.items():
                if k in META_KEYS:
                    continue
                if k in ipo and not v:
                    continue  # jangan overwrite dengan kosong
                ipo[k] = v

    # ---- 10. Merge ke CSV lama ----
    merged_df, added, updated = merge(old_df, all_list_ipos)

    if not added and not updated:
        print("")
        print("✔ Tidak ada data baru atau perubahan.")
        print(SEP)
        print("Update selesai.")
        print(SEP)
        return

    if added:
        print(f"✔ {len(added)} IPO baru ditemukan")
        print("Menambahkan:")
        for t in added:
            print(f"✔ {t}")

    if updated:
        print("Memperbarui:")
        for t in updated:
            print(f"✔ {t}")

    # ---- 11. Validasi ----
    if not validate(merged_df, expected):
        print("✖ Validasi gagal setelah merge. Dibatalkan.")
        sys.exit(1)

    # ---- 12. Backup ----
    print("✔ Membuat Backup...", end="\r")
    try:
        bp = backup()
        print(f"✔ Membuat Backup...")
        print(f"✔ {bp.name}")
    except Exception as e:
        print(f"✖ Gagal backup: {e}")
        sys.exit(1)

    # ---- 13. Simpan ----
    print("✔ Menyimpan CSV...", end="\r")
    try:
        write_csv(merged_df)
        print("✔ Menyimpan CSV...")
        print("✔ Berhasil")
    except Exception as e:
        print(f"✖ Gagal simpan: {e}")
        sys.exit(1)

    print("")
    print(SEP)
    print("Update selesai.")
    print(SEP)


if __name__ == "__main__":
    main()