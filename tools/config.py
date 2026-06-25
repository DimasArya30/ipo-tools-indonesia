from pathlib import Path

BASE_URL = "https://e-ipo.co.id"
LIST_URL = f"{BASE_URL}/id/ipo/index?view=list"
RATE_LIMIT = 0.8
MAX_RETRIES = 3
BACKOFF_BASE = 2

PROJECT_ROOT = Path(__file__).parent.parent
CSV_PATH = PROJECT_ROOT / "public" / "e-IPO Data.csv"
BACKUP_DIR = PROJECT_ROOT / "backup"
DEBUG_DIR = PROJECT_ROOT / "debug"
PROGRESS_FILE = Path(__file__).parent / ".progress"