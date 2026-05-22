"""
Tesseract OCR integration for pdfsuite.
Uses the Tesseract binary (system install or tools/tesseract) with tessdata from
python-backend/tessdata or tesseract-main/tessdata.
"""
import os
import re
import subprocess
import urllib.request

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

TESSERACT_CANDIDATES = [
    os.environ.get("TESSERACT_CMD"),
    os.path.join(REPO_ROOT, "tools", "tesseract", "tesseract.exe"),
    os.path.join(REPO_ROOT, "tools", "tesseract", "bin", "tesseract.exe"),
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
]

TESSDATA_CANDIDATES = [
    os.environ.get("TESSDATA_PREFIX"),
    os.path.join(REPO_ROOT, "python-backend", "tessdata"),
    os.path.join(REPO_ROOT, "tesseract-main", "tessdata"),
    os.path.join(REPO_ROOT, "tools", "tesseract", "tessdata"),
    r"C:\Program Files\Tesseract-OCR\tessdata",
]

TESSDATA_URL = "https://github.com/tesseract-ocr/tessdata/raw/main/{lang}.traineddata"
DEFAULT_LANG = "eng"


def _first_existing(paths):
    for p in paths:
        if p and os.path.isfile(p):
            return p
    return None


def _first_existing_dir(paths):
    for p in paths:
        if p and os.path.isdir(p):
            return p
    return None


def find_tesseract_executable():
    found = _first_existing(TESSERACT_CANDIDATES)
    if found:
        return found
    import shutil
    return shutil.which("tesseract")


def find_tessdata_dir():
    for d in TESSDATA_CANDIDATES:
        if d and os.path.isdir(d):
            if os.path.isfile(os.path.join(d, f"{DEFAULT_LANG}.traineddata")):
                return d
            if any(f.endswith(".traineddata") for f in os.listdir(d)):
                return d
    return os.path.join(REPO_ROOT, "python-backend", "tessdata")


def ensure_traineddata(lang=DEFAULT_LANG):
    tessdata = find_tessdata_dir()
    os.makedirs(tessdata, exist_ok=True)
    target = os.path.join(tessdata, f"{lang}.traineddata")
    if os.path.isfile(target):
        return tessdata
    url = TESSDATA_URL.format(lang=lang)
    try:
        urllib.request.urlretrieve(url, target)
    except Exception as e:
        raise RuntimeError(
            f"Missing {lang}.traineddata in {tessdata}. "
            f"Run scripts/setup-tesseract.ps1 or download from {url}. Error: {e}"
        )
    return tessdata


def list_available_languages():
    tessdata = find_tessdata_dir()
    if not os.path.isdir(tessdata):
        return [DEFAULT_LANG]
    langs = []
    for f in os.listdir(tessdata):
        if f.endswith(".traineddata"):
            langs.append(f.replace(".traineddata", ""))
    return sorted(langs) or [DEFAULT_LANG]


def _run_tesseract(cmd, image_path, lang, extra_args=None):
    tessdata = ensure_traineddata(lang.split("+")[0])
    env = os.environ.copy()
    env["TESSDATA_PREFIX"] = tessdata

    out_base = image_path + "_ocr_out"
    for suffix in [".txt", ".pdf", ".hocr"]:
        p = out_base + suffix
        if os.path.isfile(p):
            try:
                os.remove(p)
            except OSError:
                pass

    args = [cmd, image_path, out_base, "-l", lang, "--tessdata-dir", tessdata]
    if extra_args:
        args.extend(extra_args)

    proc = subprocess.run(
        args,
        capture_output=True,
        text=True,
        env=env,
        timeout=300,
    )
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "").strip()
        raise RuntimeError(err or f"Tesseract failed with code {proc.returncode}")

    txt_path = out_base + ".txt"
    if os.path.isfile(txt_path):
        with open(txt_path, "r", encoding="utf-8", errors="replace") as f:
            return f.read().strip()
    return ""


def ocr_image_path(image_path, lang=DEFAULT_LANG, psm=None):
    cmd = find_tesseract_executable()
    if not cmd:
        raise RuntimeError(
            "Tesseract OCR is not installed. "
            "Install from https://github.com/UB-Mannheim/tesseract/wiki "
            "or run: scripts/setup-tesseract.ps1"
        )
    extra = []
    if psm is not None:
        extra.extend(["--psm", str(psm)])
    return _run_tesseract(cmd, image_path, lang, extra)


def ocr_file(input_path, lang=DEFAULT_LANG, temp_dir=None, psm=None):
    import fitz

    temp_dir = temp_dir or os.path.dirname(input_path)
    ext = os.path.splitext(input_path)[1].lower()
    pages = []

    if ext == ".pdf":
        doc = fitz.open(input_path)
        try:
            for i in range(len(doc)):
                page = doc[i]
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                img_path = os.path.join(temp_dir, f"ocr_page_{i}_{os.getpid()}.png")
                pix.save(img_path)
                try:
                    text = ocr_image_path(img_path, lang=lang, psm=psm)
                finally:
                    try:
                        os.remove(img_path)
                    except OSError:
                        pass
                pages.append({"page": i + 1, "text": text})
        finally:
            doc.close()
    elif ext in (".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".webp", ".gif"):
        text = ocr_image_path(input_path, lang=lang, psm=psm)
        pages.append({"page": 1, "text": text})
    else:
        raise ValueError("Unsupported file type. Upload PNG, JPG, TIFF, or PDF.")

    parts = []
    for p in pages:
        if len(pages) > 1:
            parts.append(f"--- Page {p['page']} ---\n{p['text']}")
        else:
            parts.append(p["text"])
    full_text = "\n\n".join(parts).strip()

    return {
        "text": full_text,
        "pages": pages,
        "page_count": len(pages),
        "language": lang,
    }


def write_text_output(text, temp_dir):
    out_path = os.path.join(temp_dir, f"ocr_{os.getpid()}.txt")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text)
    return out_path


def tesseract_status():
    cmd = find_tesseract_executable()
    langs = []
    err = None
    try:
        if cmd:
            langs = list_available_languages()
    except Exception as e:
        err = str(e)
    return {
        "installed": bool(cmd),
        "command": cmd,
        "tessdata": find_tessdata_dir(),
        "languages": langs,
        "error": err,
    }
