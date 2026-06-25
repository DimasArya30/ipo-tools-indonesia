import shutil
from datetime import datetime
from pathlib import Path

import pandas as pd

from config import CSV_PATH, BACKUP_DIR


def read_csv(path=None):
    p = path or CSV_PATH
    if not p.exists():
        raise FileNotFoundError(f"CSV tidak ditemukan: {p}")
    return pd.read_csv(p, dtype=str, keep_default_na=False)


def validate(df, expected):
    actual = list(df.columns)
    if actual != expected:
        missing = set(expected) - set(actual)
        extra = set(actual) - set(expected)
        if missing:
            print(f"  ✖ Kolom hilang: {missing}")
        if extra:
            print(f"  ✖ Kolom ekstra: {extra}")
        if sorted(actual) == sorted(expected) and actual != expected:
            print("  ✖ Urutan kolom berbeda")
        return False
    return True


def backup(path=None, bdir=None):
    p = path or CSV_PATH
    d = bdir or BACKUP_DIR
    d.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    dest = d / f"{p.stem}_{ts}.csv"
    shutil.copy2(p, dest)
    return dest


def write_csv(df, path=None):
    p = path or CSV_PATH
    p.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(p, index=False, encoding="utf-8")