from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app.models import Document, DocumentRevision, Finding
from backend.app.schemas import (
    DocumentCreate, DocumentUpdate, DocumentListItem, DocumentDetail,
    DocumentRevisionCreate, DocumentRevisionResponse, AnalyzeContentRequest, AnalysisResultSchema
)
from backend.app.engine.analyzer import analyze_content
from backend.app.engine.audit_service import log_audit

router = APIRouter(prefix="/documents", tags=["Documents & Content Analysis"])

@router.get("/", response_model=List[DocumentListItem])
def list_documents(
    status: Optional[str] = Query(None),
    document_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Document)
    if status:
        query = query.filter(Document.status == status)
    if document_type:
        query = query.filter(Document.document_type == document_type)
    if search:
        query = query.filter(Document.title.ilike(f"%{search}%"))
        
    docs = query.order_by(Document.updated_at.desc()).all()
    results = []
    
    for doc in docs:
        # Get latest revision
        latest_rev = (
            db.query(DocumentRevision)
            .filter(DocumentRevision.document_id == doc.id)
            .order_by(DocumentRevision.version.desc())
            .first()
        )
        score = latest_rev.compliance_score if latest_rev else 100.0
        critical_count = 0
        total_count = 0
        if latest_rev:
            critical_count = db.query(Finding).filter(
                Finding.document_revision_id == latest_rev.id,
                Finding.severity == "critical"
            ).count()
            total_count = db.query(Finding).filter(
                Finding.document_revision_id == latest_rev.id
            ).count()

        results.append(DocumentListItem(
            id=doc.id,
            title=doc.title,
            document_type=doc.document_type,
            status=doc.status,
            current_version=doc.current_version,
            compliance_score=score,
            critical_findings_count=critical_count,
            total_findings_count=total_count,
            created_at=doc.created_at,
            updated_at=doc.updated_at
        ))
    return results

@router.post("/", response_model=DocumentDetail)
def create_document(data: DocumentCreate, db: Session = Depends(get_db)):
    # 1. Create Document
    doc = Document(
        title=data.title,
        document_type=data.document_type,
        status="draft",
        current_version=1
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # 2. Run Deterministic Analysis on initial content
    analysis = analyze_content(data.content, db)

    # 3. Create initial revision v1
    rev = DocumentRevision(
        document_id=doc.id,
        version=1,
        content=data.content,
        created_by=data.created_by,
        notes=data.notes or "Initial version",
        compliance_score=analysis["compliance_score"]
    )
    db.add(rev)
    db.commit()
    db.refresh(rev)

    # 4. Save Findings
    for f in analysis["findings"]:
        finding = Finding(
            document_revision_id=rev.id,
            category=f["category"],
            severity=f["severity"],
            matched_text=f["matched_text"],
            start_index=f["start_index"],
            end_index=f["end_index"],
            message=f["message"],
            suggestion=f.get("suggestion"),
            evidence=f.get("evidence"),
            status="open"
        )
        db.add(finding)
    db.commit()

    log_audit(
        db,
        action="DOCUMENT_CREATED",
        entity_type="document",
        entity_id=str(doc.id),
        performed_by=data.created_by,
        details={
            "title": doc.title,
            "document_type": doc.document_type,
            "compliance_score": analysis["compliance_score"],
            "total_findings": analysis["total_findings"]
        }
    )

    db.refresh(doc)
    return doc

@router.post("/analyze-draft", response_model=AnalysisResultSchema)
def analyze_draft_text(data: AnalyzeContentRequest, db: Session = Depends(get_db)):
    """
    On-the-fly content analysis for the live editor without saving to database.
    """
    analysis = analyze_content(data.content, db)
    return analysis

@router.get("/{document_id}", response_model=DocumentDetail)
def get_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.put("/{document_id}", response_model=DocumentDetail)
def update_document(document_id: int, data: DocumentUpdate, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    old_status = doc.status
    if data.title is not None:
        doc.title = data.title
    if data.document_type is not None:
        doc.document_type = data.document_type
    if data.status is not None:
        doc.status = data.status

    db.commit()
    db.refresh(doc)

    log_audit(
        db,
        action="DOCUMENT_STATUS_CHANGED" if old_status != doc.status else "DOCUMENT_UPDATED",
        entity_type="document",
        entity_id=str(doc.id),
        details={"old_status": old_status, "new_status": doc.status, "title": doc.title}
    )
    return doc

@router.post("/{document_id}/revisions", response_model=DocumentRevisionResponse)
def create_document_revision(
    document_id: int,
    data: DocumentRevisionCreate,
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    new_version = doc.current_version + 1
    doc.current_version = new_version
    # If document was changes_requested, updating revision resets status to in_review or draft
    if doc.status == "changes_requested":
        doc.status = "in_review"

    # Run analysis
    analysis = analyze_content(data.content, db)

    rev = DocumentRevision(
        document_id=doc.id,
        version=new_version,
        content=data.content,
        created_by=data.created_by,
        notes=data.notes or f"Revision {new_version}",
        compliance_score=analysis["compliance_score"]
    )
    db.add(rev)
    db.commit()
    db.refresh(rev)

    for f in analysis["findings"]:
        finding = Finding(
            document_revision_id=rev.id,
            category=f["category"],
            severity=f["severity"],
            matched_text=f["matched_text"],
            start_index=f["start_index"],
            end_index=f["end_index"],
            message=f["message"],
            suggestion=f.get("suggestion"),
            evidence=f.get("evidence"),
            status="open"
        )
        db.add(finding)
    db.commit()
    db.refresh(rev)

    log_audit(
        db,
        action="REVISION_CREATED",
        entity_type="document",
        entity_id=str(doc.id),
        performed_by=data.created_by,
        details={
            "version": new_version,
            "compliance_score": analysis["compliance_score"],
            "total_findings": analysis["total_findings"]
        }
    )
    return rev

@router.put("/findings/{finding_id}/status")
def update_finding_status(
    finding_id: int,
    status: str = Query(..., pattern="^(open|accepted|dismissed)$"),
    db: Session = Depends(get_db)
):
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
        
    finding.status = status
    db.commit()

    log_audit(
        db,
        action="FINDING_STATUS_UPDATED",
        entity_type="finding",
        entity_id=str(finding.id),
        details={"status": status, "matched_text": finding.matched_text}
    )
    return {"message": f"Finding #{finding_id} marked as {status}"}

@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    title = doc.title
    db.delete(doc)
    db.commit()

    log_audit(
        db,
        action="DOCUMENT_DELETED",
        entity_type="document",
        entity_id=str(document_id),
        details={"title": title}
    )
    return {"message": f"Document '{title}' deleted"}
