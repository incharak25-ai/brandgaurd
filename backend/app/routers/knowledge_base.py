import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import KnowledgeBaseSource
from backend.app.schemas import KnowledgeBaseSourceResponse, KnowledgeBaseSourceCreate
from backend.app.config import settings
from backend.app.engine.extractor import extract_text_from_file
from backend.app.engine.audit_service import log_audit

router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base"])

@router.get("/", response_model=List[KnowledgeBaseSourceResponse])
def list_kb_sources(db: Session = Depends(get_db)):
    return db.query(KnowledgeBaseSource).order_by(KnowledgeBaseSource.updated_at.desc()).all()

@router.post("/", response_model=KnowledgeBaseSourceResponse)
def create_kb_source(data: KnowledgeBaseSourceCreate, db: Session = Depends(get_db)):
    source = KnowledgeBaseSource(
        title=data.title,
        description=data.description,
        source_type=data.source_type,
        version=data.version,
        status=data.status,
        extracted_text=data.extracted_text
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    
    log_audit(
        db,
        action="KB_SOURCE_CREATED",
        entity_type="knowledge_base",
        entity_id=str(source.id),
        details={"title": source.title, "source_type": source.source_type}
    )
    return source

@router.post("/upload", response_model=KnowledgeBaseSourceResponse)
async def upload_kb_source(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    source_type: str = Form("brand_guidelines"),
    version: int = Form(1),
    status: str = Form("approved"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Save file
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    extracted_text, _ = extract_text_from_file(file_path)

    source = KnowledgeBaseSource(
        title=title,
        description=description,
        source_type=source_type,
        version=version,
        status=status,
        file_path=file_path,
        extracted_text=extracted_text
    )
    db.add(source)
    db.commit()
    db.refresh(source)

    log_audit(
        db,
        action="KB_SOURCE_UPLOADED",
        entity_type="knowledge_base",
        entity_id=str(source.id),
        details={"title": source.title, "filename": file.filename}
    )
    return source

@router.get("/{source_id}", response_model=KnowledgeBaseSourceResponse)
def get_kb_source(source_id: int, db: Session = Depends(get_db)):
    source = db.query(KnowledgeBaseSource).filter(KnowledgeBaseSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Knowledge base source not found")
    return source

@router.put("/{source_id}", response_model=KnowledgeBaseSourceResponse)
def update_kb_source(
    source_id: int,
    data: KnowledgeBaseSourceCreate,
    db: Session = Depends(get_db)
):
    source = db.query(KnowledgeBaseSource).filter(KnowledgeBaseSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Knowledge base source not found")
        
    source.title = data.title
    source.description = data.description
    source.source_type = data.source_type
    source.version = data.version
    source.status = data.status
    source.extracted_text = data.extracted_text
    db.commit()
    db.refresh(source)

    log_audit(
        db,
        action="KB_SOURCE_UPDATED",
        entity_type="knowledge_base",
        entity_id=str(source.id),
        details={"title": source.title, "version": source.version, "status": source.status}
    )
    return source

@router.delete("/{source_id}")
def delete_kb_source(source_id: int, db: Session = Depends(get_db)):
    source = db.query(KnowledgeBaseSource).filter(KnowledgeBaseSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Knowledge base source not found")
    
    title = source.title
    db.delete(source)
    db.commit()

    log_audit(
        db,
        action="KB_SOURCE_DELETED",
        entity_type="knowledge_base",
        entity_id=str(source_id),
        details={"title": title}
    )
    return {"message": f"Knowledge base source '{title}' deleted"}
