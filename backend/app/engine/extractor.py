import os
from typing import Tuple
from pypdf import PdfReader
from docx import Document as DocxDocument

def extract_text_from_file(file_path: str) -> Tuple[str, str]:
    """
    Extracts text from a given file path based on its extension.
    Returns (extracted_text, file_type).
    """
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext in [".txt", ".md", ".markdown", ".csv", ".json"]:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read(), ext[1:]
            
    elif ext == ".pdf":
        try:
            reader = PdfReader(file_path)
            pages_text = []
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    pages_text.append(text.strip())
            return "\n\n".join(pages_text), "pdf"
        except Exception as e:
            return f"Error extracting PDF: {str(e)}", "pdf"
            
    elif ext in [".docx", ".doc"]:
        try:
            doc = DocxDocument(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            return "\n\n".join(paragraphs), "docx"
        except Exception as e:
            return f"Error extracting DOCX: {str(e)}", "docx"
            
    else:
        # Fallback to text read
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read(), "unknown"
