import time
from config import MAX_RETRIES, BACKOFF_BASE, RATE_LIMIT, DEBUG_DIR
from pathlib import Path

HEADERS_OVERRIDE = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://e-ipo.co.id/",
}


class BrowserSession:
    """Satu browser instance untuk seluruh sesi."""

    def __init__(self):
        self.pw = None
        self.browser = None
        self.ctx = None

    def start(self):
        from playwright.sync_api import sync_playwright
        self.pw = sync_playwright().start()
        self.browser = self.pw.chromium.launch(headless=True)
        self.ctx = self.browser.new_context(
            user_agent=HEADERS_OVERRIDE["User-Agent"],
            viewport={"width": 1920, "height": 1080},
        )

    def fetch(self, url, wait_for=None):
        for attempt in range(MAX_RETRIES):
            page = None
            try:
                page = self.ctx.new_page()
                page.goto(url, wait_until="domcontentloaded", timeout=30000)
                if wait_for:
                    try:
                        page.wait_for_selector(wait_for, timeout=12000)
                    except Exception:
                        pass
                page.wait_for_timeout(2000)
                html = page.content()
                page.close()
                return html
            except Exception as e:
                if page:
                    try:
                        page.close()
                    except Exception:
                        pass
                if attempt == MAX_RETRIES - 1:
                    raise
                wait = BACKOFF_BASE ** attempt
                print(f"    ⚠ Gagal (percobaan {attempt + 1}), retry {wait}s... — {e}")
                time.sleep(wait)

    def screenshot(self, url, path):
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        page = None
        try:
            page = self.ctx.new_page()
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(3000)
            page.screenshot(path=str(path), full_page=True)
        finally:
            if page:
                try:
                    page.close()
                except Exception:
                    pass

    def close(self):
        if self.ctx:
            self.ctx.close()
        if self.browser:
            self.browser.close()
        if self.pw:
            self.pw.stop()