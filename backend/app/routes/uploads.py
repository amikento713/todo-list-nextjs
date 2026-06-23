import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile

from app.auth import get_current_user
from app import models

router = APIRouter(tags=["uploads"])

UPLOAD_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
)

os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_SIZE = 20 * 1024 * 1024
PDF_MAGIC = b"%PDF"


@router.post("/upload-book")
async def upload_book(
    request: Request,
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
):
    del current_user

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    filename = file.filename or "upload.pdf"
    base_name = os.path.basename(filename).replace("..", "")
    if not base_name.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    safe_name = f"{uuid.uuid4().hex}_{base_name}"
    dest_path = os.path.join(UPLOAD_DIR, safe_name)

    size = 0
    header_checked = False
    try:
        with open(dest_path, "wb") as out_file:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break

                if not header_checked:
                    if not chunk.startswith(PDF_MAGIC):
                        raise HTTPException(
                            status_code=400, detail="Only PDF files are allowed"
                        )
                    header_checked = True

                size += len(chunk)
                if size > MAX_SIZE:
                    raise HTTPException(
                        status_code=413, detail="File too large (max 20MB)"
                    )
                out_file.write(chunk)
    except HTTPException:
        if os.path.exists(dest_path):
            os.remove(dest_path)
        raise
    finally:
        await file.close()

    base = str(request.base_url).rstrip("/")
    url = f"{base}/books/{safe_name}"

    return {"filename": safe_name, "url": url}
