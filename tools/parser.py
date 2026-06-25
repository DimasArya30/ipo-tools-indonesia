import re
from urllib.parse import urljoin
from bs4 import BeautifulSoup

BASE_URL = "https://e-ipo.co.id"

# ============================================================
# STATUS CLASS → TEKS
# ============================================================
STATUS_CLASS_MAP = {
    "panelbookbuilding": "Book Building",
    "panelwaiting": "Waiting For Offering",
    "panelwaitingforoffering": "Waiting For Offering",
    "paneloffering": "Offering",
    "panelallotment": "Allotment",
    "panelclosed": "Closed",
    "panellisting": "Listed",
    "panellisted": "Listed",
}

# ============================================================
# LABEL WEBSITE → KOLOM CSV
# ============================================================
LABEL_MAP = {
    "status": "IPO Status",
    "kode emiten": "Ticker Code",
    "nama emiten": "Company Name",
    "nama perusahaan": "Company Name",
    "sektor": "Sector",
    "sub sektor": "Subsector",
    "subsektor": "Subsector",
    "papan pencatatan": "Listing Board",
    "papan": "Listing Board",
    "harga penawaran": "Final Price (Rp)",
    "harga": "Final Price (Rp)",
    "jumlah lembar saham yang ditawarkan": "Number of Shares Offered",
    "jumlah lembar saham": "Number of Shares Offered",
    "lembar saham": "Number of Shares Offered",
    "persentase jumlah saham yang ditawarkan": "Offering Percentage",
    "persentase penawaran": "Offering Percentage",
    "persentase": "Offering Percentage",
    "penjamin emisi efek": "Underwriter",
    "penjamin emisi": "Underwriter",
    "periode penawaran awal": "Book Building Opening",
    "book building opening": "Book Building Opening",
    "tanggal mulai book building": "Book Building Opening",
    "tanggal mulai book building": "Book Building Opening",
    "periode penawaran akhir": "Book Building Closing",
    "book building closing": "Book Building Closing",
    "tanggal selesai book building": "Book Building Closing",
    "tanggal selesai book building": "Book Building Closing",
    "tanggal penawaran": "Offering Date",
    "offering date": "Offering Date",
    "tanggal penutupan penawaran": "Closing Date",
    "tanggal penutupan": "Closing Date",
    "closing date": "Closing Date",
    "tanggal distribusi": "Distribution Date",
    "distribution date": "Distribution Date",
    "tanggal pencatatan": "Listing Date",
    "listing date": "Listing Date",
    "website": "Website",
    "bidang usaha": "Line of Business",
    "line of business": "Line of Business",
    "return d1": "Return D1",
    "return d2": "Return D2",
    "return d3": "Return D3",
    "return d4": "Return D4",
    "return d5": "Return D5",
    "return d6": "Return D6",
    "return d7": "Return D7",
    "return from listing date": "Return From Listing Date",
}

SKIP_LABELS = {"no", "nomor", "no.", "#", "aksi", "action", ""}


def _norm(text):
    return text.lower().strip().rstrip(":")


def _find_col(label):
    n = _norm(label)
    if n in SKIP_LABELS:
        return None
    if n in LABEL_MAP:
        return LABEL_MAP[n]
    best = []
    for k, c in LABEL_MAP.items():
        if k in n:
            best.append((len(k), c))
    if best:
        best.sort(key=lambda x: -x[0])
        return best[0][1]
    return None


def _clean(text):
    return re.sub(r"\s+", " ", text.replace("\n", " ").replace("\r", "")).strip()


# ============================================================
# LIST PAGE
# ============================================================

def get_last_page(soup):
    pag = soup.select_one("ul.pagination")
    if not pag:
        return 1
    mx = 1
    for a in pag.find_all("a", href=True):
        m = re.search(r"page=(\d+)", a["href"])
        if m:
            mx = max(mx, int(m.group(1)))
    return mx


def parse_list_page(html, csv_columns):
    soup = BeautifulSoup(html, "lxml")
    last_page = get_last_page(soup)
    blocks = soup.select("div[data-key]")
    ipos = []
    for b in blocks:
        ipo = _parse_block(b, csv_columns)
        if ipo and ipo.get("Ticker Code"):
            ipos.append(ipo)
    return ipos, last_page


def _parse_block(block, csv_columns):
    dk = block.get("data-key", "")

    # --- Status ---
    status = ""
    td = block.select_one(".pricing-title")
    if td:
        for cls in td.get("class", []):
            if cls in STATUS_CLASS_MAP:
                status = STATUS_CLASS_MAP[cls]
                break
        if not status:
            p = td.find("p")
            if p:
                status = _clean(p.get_text())

    # --- Nama & Ticker ---
    company = ""
    ticker = ""
    h3 = block.select_one("h3")
    if h3:
        txt = h3.get_text(separator=" ", strip=True)
        m = re.search(r"\((\w+)\)", txt)
        if m:
            ticker = m.group(1)
            company = _clean(txt[: m.start()])
        else:
            company = _clean(txt)

    # --- Detail URL ---
    detail_url = ""
    for a in block.find_all("a", href=True):
        h = a["href"]
        if "/id/ipo/" in h and "index" not in h:
            detail_url = h
            break

    # --- Logo ---
    logo = ""
    img = block.select_one("img.img-list")
    if img:
        s = img.get("src", "")
        if s:
            logo = urljoin(BASE_URL, s)

    # --- Fields dari col-md ---
    fields = {}
    pb = block.select_one(".panel-body")
    if pb:
        for col in pb.find_all("div", class_=re.compile(r"col-md-")):
            h5 = col.find("h5")
            if not h5:
                continue
            label = h5.get_text(strip=True)
            ccol = _find_col(label)
            if not ccol or ccol not in csv_columns:
                continue
            parts = []
            for child in col.children:
                if child is h5:
                    continue
                if hasattr(child, "get_text"):
                    t = child.get_text(strip=True)
                    if t:
                        parts.append(t)
            val = _clean(" ".join(parts))
            if val:
                fields[ccol] = val

    result = {c: "" for c in csv_columns}
    result["IPO Status"] = status
    result["Ticker Code"] = ticker
    result["Company Name"] = company
    for k, v in fields.items():
        result[k] = v

    # Metadata (tidak masuk CSV)
    result["_detail_url"] = detail_url
    result["_logo_url"] = logo
    result["_data_key"] = dk
    return result


# ============================================================
# DETAIL PAGE
# ============================================================

def parse_detail_page(html, csv_columns):
    soup = BeautifulSoup(html, "lxml")
    result = {}

    # Strategi 1: tabel
    result.update(_from_table(soup, csv_columns))
    # Strategi 2: dt/dl, th/td, strong
    result.update(_from_defs(soup, csv_columns))
    # Strategi 3: regex teks
    if len(result) < 3:
        result.update(_from_text(html, csv_columns))

    result["_prospektus"] = _find_pdfs(soup)
    if not result.get("Website"):
        result["Website"] = _find_website(soup)
    return result


def _from_table(soup, csv_columns):
    f = {}
    for tbl in soup.find_all("table"):
        for tr in tbl.find_all("tr"):
            cells = tr.find_all(["td", "th"])
            if len(cells) >= 2:
                lbl = _clean(cells[0].get_text())
                val = _clean(cells[1].get_text())
                c = _find_col(lbl)
                if c and c in csv_columns and val:
                    f[c] = val
    return f


def _from_defs(soup, csv_columns):
    f = {}
    for tag in soup.find_all(["dt", "th", "strong", "b", "label"]):
        lbl = _clean(tag.get_text())
        c = _find_col(lbl)
        if not c or c not in csv_columns:
            continue
        val = ""
        sib = tag.find_next_sibling()
        if sib and hasattr(sib, "get_text"):
            val = _clean(sib.get_text())
        if not val:
            par = tag.parent
            if par:
                ps = par.find_next_sibling()
                if ps and hasattr(ps, "get_text"):
                    val = _clean(ps.get_text())
        if val:
            f[c] = val
    return f


def _from_text(html, csv_columns):
    f = {}
    text = re.sub(r"<[^>]+>", " | ", html)
    text = re.sub(r"\s+", " ", text)
    for lbl, c in LABEL_MAP.items():
        if c not in csv_columns:
            continue
        pat = re.escape(lbl) + r"\s*[:\|]\s*([^|]{1,200}?)(?=\||$)"
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            v = _clean(m.group(1))
            if v:
                f[c] = v
    return f


def _find_pdfs(soup):
    urls = []
    for a in soup.find_all("a", href=True):
        h = a["href"].lower()
        t = a.get_text(strip=True).lower()
        if h.endswith(".pdf") or "prospektus" in t or "informasi tambahan" in t:
            urls.append(urljoin(BASE_URL, a["href"]))
    return urls


def _find_website(soup):
    for a in soup.find_all("a", href=True):
        t = a.get_text(strip=True).lower()
        if "website" in t and a["href"].startswith("http"):
            return a["href"]
    return ""