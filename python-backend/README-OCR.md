# Tesseract OCR integration

The website OCR tool (`/tools/ocr`) uses the **Tesseract** binary via `tesseract_ocr.py`, aligned with the `tesseract-main` source folder in this repo.

## One-time setup (Windows)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-tesseract.ps1
```

This downloads `eng.traineddata` (and optional `osd`) into `python-backend/tessdata` and checks for Tesseract in Program Files.

## Install Tesseract binary

If not installed:

- **winget:** `winget install UB-Mannheim.TesseractOCR`
- **Manual:** https://github.com/UB-Mannheim/tesseract/wiki

Set `TESSERACT_CMD` to your `tesseract.exe` path if it is not on PATH.

## API tasks

| Task | Description |
|------|-------------|
| `ocr-tesseract` | POST file + `lang` (default `eng`) + `output_type` (`json` or `txt`) |
| `ocr-status` | Returns `{ installed, command, tessdata, languages }` |

## Extra languages

Download `.traineddata` from [tessdata](https://github.com/tesseract-ocr/tessdata) into `python-backend/tessdata/`, then restart the backend.
