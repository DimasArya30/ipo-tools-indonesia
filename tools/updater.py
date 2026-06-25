import pandas as pd

TICKER_COL = "Ticker Code"
# Kolom yang menentukan apakah perlu kunjungi detail page
KEY_COLS = {
    "IPO Status", "Final Price (Rp)", "Offering Date", "Closing Date",
    "Distribution Date", "Listing Date", "Underwriter", "Number of Shares Offered",
    "Offering Percentage", "Website", "Line of Business", "Sector", "Subsector",
}


def needs_detail(new_row, old_row):
    """Cek apakah perlu buka detail page."""
    for col in KEY_COLS:
        nv = str(new_row.get(col, "")).strip()
        ov = str(old_row.get(col, "")).strip()
        if nv != ov:
            return True
    # Juga jika ada field penting yang kosong di CSV tapi ada di list
    for col in KEY_COLS:
        if not str(old_row.get(col, "")).strip() and str(new_row.get(col, "")).strip():
            return True
    return False


def merge(old_df, records):
    """Merge list baru ke DataFrame lama. Return (df, added, updated)."""
    cols = list(old_df.columns)
    col_set = set(cols)
    added = []
    updated = []

    idx_map = {}
    for i, row in old_df.iterrows():
        t = str(row[TICKER_COL]).strip()
        if t:
            idx_map[t] = i

    for rec in records:
        ticker = rec.get(TICKER_COL, "").strip()
        if not ticker:
            continue

        full = {c: rec.get(c, "") for c in cols}

        if ticker not in idx_map:
            old_df.loc[len(old_df)] = full
            idx_map[ticker] = len(old_df) - 1
            added.append(ticker)
        else:
            idx = idx_map[ticker]
            changed = False
            for c in cols:
                if c == TICKER_COL:
                    continue
                nv = str(full.get(c, "")).strip()
                ov = str(old_df.at[idx, c]).strip()
                if nv and ov != nv:
                    old_df.at[idx, c] = nv
                    changed = True
            if changed:
                updated.append(ticker)

    return old_df, added, updated


def get_existing_map(df):
    """Return dict ticker → row (semua kolom)."""
    m = {}
    for _, row in df.iterrows():
        t = str(row[TICKER_COL]).strip()
        if t:
            m[t] = {c: str(row[c]).strip() for c in df.columns}
    return m