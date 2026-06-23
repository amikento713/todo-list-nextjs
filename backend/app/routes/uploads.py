import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse

router = APIRouter(tags=["uploads"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "uploads")
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))

os.makedirs(UPLOAD_DIR, exist_ok=True)

# 20 MB
MAX_SIZE = 20 * 1024 * 1024


@router.post("/upload-book")
async def upload_book(request: Request, file: UploadFile = File(...)):
    # Validate content type
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Save streaming to disk and enforce max size
    filename = file.filename
    safe_name = filename.replace("..", "")
    dest_path = os.path.join(UPLOAD_DIR, safe_name)

    size = 0
    try:
        with open(dest_path, "wb") as out_file:
            while True:
                chunk = await file.read(1024 * 1024)  # 1MB
                if not chunk:
                    break
                size += len(chunk)
                if size > MAX_SIZE:
                    # remove partial file
                    out_file.close()
                    os.remove(dest_path)
                    raise HTTPException(status_code=413, detail="File too large (max 20MB)")
                out_file.write(chunk)
    finally:
        await file.close()

    # Build URL to access file
    base = str(request.base_url).rstrip("/")
    url = f"{base}/books/{safe_name}"

    return JSONResponse({"filename": safe_name, "url": url})
