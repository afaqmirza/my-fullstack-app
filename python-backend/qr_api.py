"""
qr_api.py — Headless QR code worker
stdin  → JSON { "action": "decode"|"generate", ...fields }
stdout → JSON { "success": true, ... } | { "success": false, "error": "..." }

DECODE:
  in:  { "action": "decode", "image_path": "..." }
  out: { "success": true, "text": "...", "count": 1 }

GENERATE:
  in:  { "action": "generate", "text": "...", "size": 10, "border": 4,
          "fill_color": "black", "back_color": "white",
          "format": "png"|"svg", "output_path": "..." }
  out: { "success": true, "output": "path/to/file.png" }
"""

import sys, os, json, traceback

def decode_qr(image_path: str):
    import cv2
    import numpy as np
    from PIL import Image

    pil_img = Image.open(image_path).convert("RGB")
    cv_img  = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

    # Use OpenCV's built-in multi QR detector (no external DLL needed)
    detector = cv2.QRCodeDetector()

    # Try multi-detect first
    retval, decoded_info, points, straight_qrcode = detector.detectAndDecodeMulti(cv_img)
    if retval and decoded_info:
        results = [d for d in decoded_info if d]  # filter empty strings
        if results:
            return {"success": True, "text": results[0], "all": results,
                    "count": len(results)}

    # Fallback to single detect
    data, bbox, _ = detector.detectAndDecode(cv_img)
    if data:
        return {"success": True, "text": data, "all": [data], "count": 1}

    # Try on grayscale
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    data, bbox, _ = detector.detectAndDecode(gray)
    if data:
        return {"success": True, "text": data, "all": [data], "count": 1}

    return {"success": True, "text": None, "count": 0,
            "message": "No QR code found in image."}


def generate_qr(text: str, size: int, border: int,
                fill_color: str, back_color: str,
                fmt: str, output_path: str):
    import qrcode

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=max(1, size),
        border=max(1, border),
    )
    qr.add_data(text)
    qr.make(fit=True)

    if fmt == "svg":
        import qrcode.image.svg as qsvg
        import io
        factory = qsvg.SvgImage
        img = qr.make_image(image_factory=factory)
        with open(output_path, "wb") as f:
            img.save(f)
    else:
        pil_img = qr.make_image(
            fill_color=fill_color or "black",
            back_color=back_color or "white"
        ).convert("RGB")
        pil_img.save(output_path)

    return {"success": True, "output": output_path}


def main():
    try:
        raw = sys.stdin.read()
        if not raw.strip():
            print(json.dumps({"success": False, "error": "No input"}))
            return
        data   = json.loads(raw)
        action = data.get("action", "")

        if action == "decode":
            result = decode_qr(data["image_path"])
        elif action == "generate":
            result = generate_qr(
                text        = data.get("text", ""),
                size        = int(data.get("size", 10)),
                border      = int(data.get("border", 4)),
                fill_color  = data.get("fill_color", "black"),
                back_color  = data.get("back_color", "white"),
                fmt         = data.get("format", "png"),
                output_path = data["output_path"],
            )
        else:
            result = {"success": False, "error": f"Unknown action: {action}"}

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({
            "success":   False,
            "error":     str(e),
            "traceback": traceback.format_exc()
        }))


if __name__ == "__main__":
    main()
