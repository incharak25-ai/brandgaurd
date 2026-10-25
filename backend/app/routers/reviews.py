from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Document, DocumentRevision, Finding, ReviewDecision, Comment
from backend.app.schemas import (
    ReviewDecisionCreate, ReviewDecisionResponse, CommentCreate, CommentResponse, DocumentListItem
)
from backend.app.engine.audit_service import log_audit

router = APIRouter(prefix="/reviews", tags=["Human Review Workflow"])

@router.get("/queue", response_model=List[DocumentListItem])
def get_approval_queue(db: Session = Depends(get_db)):
    """
    Returns documents awaiting review or in review.
    """
    docs = (
        db.query(Document)
        .filter(Document.status.in_(["in_review", "changes_requested"]))
        .order_by(Document.updated_at.desc())
        .all()
    )
    results = []
    for doc in docs:
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

@router.post("/{document_id}/decision", response_model=ReviewDecisionResponse)
def submit_review_decision(
    document_id: int,
    data: ReviewDecisionCreate,
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    decision_norm = data.decision.lower()
    if decision_norm not in ["approved", "rejected", "changes_requested"]:
        raise HTTPException(status_code=400, detail="Invalid decision. Must be approved, rejected, or changes_requested.")

    # Update document status
    doc.status = decision_norm
    
    # Create decision record
    rec = ReviewDecision(
        document_id=doc.id,
        document_revision_id=data.document_revision_id,
        reviewer_name=data.reviewer_name,
        decision=decision_norm,
        rationale=data.rationale
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    log_audit(
        db,
        action=f"REVIEW_DECISION_{decision_norm.upper()}",
        entity_type="review",
        entity_id=str(rec.id),
        performed_by=data.reviewer_name,
        details={
            "document_id": doc.id,
            "document_title": doc.title,
            "decision": decision_norm,
            "rationale": data.rationale
        }
    )
    return rec

@router.post("/{document_id}/comments", response_model=CommentResponse)
def add_comment(
    document_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    comment = Comment(
        document_id=doc.id,
        author=data.author,
        content=data.content
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    log_audit(
        db,
        action="COMMENT_ADDED",
        entity_type="document",
        entity_id=str(doc.id),
        performed_by=data.author,
        details={"content_preview": data.content[:100]}
    )
    return comment
