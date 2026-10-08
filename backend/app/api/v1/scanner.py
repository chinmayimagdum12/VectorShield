from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.defense.l1_sanitizer import l1_sanitizer
from app.models.schemas import ScanResult

router = APIRouter(prefix="/scanner", tags=["Scanner"])

class ScanTextRequest(BaseModel):
    text: str
    source_name: Optional[str] = "direct_input"

@router.post("/scan-text", response_model=ScanResult)
def scan_text(req: ScanTextRequest):
    return l1_sanitizer.scan(req.text)

@router.post("/scan-file", response_model=ScanResult)
async def scan_file(file: UploadFile = File(...)):
    filename = file.filename or "uploaded_file"
    content_bytes = await file.read()
    
    # Extract text according to file extension
    text = ""
    lower_name = filename.lower()
    if lower_name.endswith((".txt", ".md", ".html", ".htm", ".json", ".csv")):
        text = content_bytes.decode("utf-8", errors="ignore")
    elif lower_name.endswith(".pdf"):
        try:
            import io
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(content_bytes))
            text = " ".join([page.extract_text() or "" for page in reader.pages])
        except Exception as e:
            text = content_bytes.decode("utf-8", errors="ignore")
    elif lower_name.endswith(".docx"):
        try:
            import io
            import docx
            doc = docx.Document(io.BytesIO(content_bytes))
            text = " ".join([p.text for p in doc.paragraphs])
        except Exception:
            text = content_bytes.decode("utf-8", errors="ignore")
    else:
        text = content_bytes.decode("utf-8", errors="ignore")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Unable to extract textual content from uploaded file.")

    scan_res = l1_sanitizer.scan(text)
    scan_res.metadata["filename"] = filename
    return scan_res
