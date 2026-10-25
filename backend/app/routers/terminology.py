from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Terminology
from backend.app.schemas import TerminologyResponse, TerminologyCreate
from backend.app.engine.audit_service import log_audit

router = APIRouter(prefix="/terminology", tags=["Terminology Rules"])

@router.get("/", response_model=List[TerminologyResponse])
def list_terms(
    term_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Terminology)
    if term_type:
        query = query.filter(Terminology.term_type == term_type)
    if severity:
        query = query.filter(Terminology.severity == severity)
    if search:
        query = query.filter(Terminology.term.ilike(f"%{search}%"))
    return query.order_by(Terminology.term.asc()).all()

@router.post("/", response_model=TerminologyResponse)
def create_term(data: TerminologyCreate, db: Session = Depends(get_db)):
    term = Terminology(
        term=data.term,
        term_type=data.term_type,
        preferred_alternative=data.preferred_alternative,
        context_rule=data.context_rule,
        severity=data.severity
    )
    db.add(term)
    db.commit()
    db.refresh(term)

    log_audit(
        db,
        action="TERMINOLOGY_CREATED",
        entity_type="terminology",
        entity_id=str(term.id),
        details={"term": term.term, "term_type": term.term_type, "severity": term.severity}
    )
    return term

@router.get("/{term_id}", response_model=TerminologyResponse)
def get_term(term_id: int, db: Session = Depends(get_db)):
    term = db.query(Terminology).filter(Terminology.id == term_id).first()
    if not term:
        raise HTTPException(status_code=404, detail="Terminology rule not found")
    return term

@router.put("/{term_id}", response_model=TerminologyResponse)
def update_term(term_id: int, data: TerminologyCreate, db: Session = Depends(get_db)):
    term = db.query(Terminology).filter(Terminology.id == term_id).first()
    if not term:
        raise HTTPException(status_code=404, detail="Terminology rule not found")
        
    term.term = data.term
    term.term_type = data.term_type
    term.preferred_alternative = data.preferred_alternative
    term.context_rule = data.context_rule
    term.severity = data.severity
    db.commit()
    db.refresh(term)

    log_audit(
        db,
        action="TERMINOLOGY_UPDATED",
        entity_type="terminology",
        entity_id=str(term.id),
        details={"term": term.term, "term_type": term.term_type}
    )
    return term

@router.delete("/{term_id}")
def delete_term(term_id: int, db: Session = Depends(get_db)):
    term = db.query(Terminology).filter(Terminology.id == term_id).first()
    if not term:
        raise HTTPException(status_code=404, detail="Terminology rule not found")
    
    t_text = term.term
    db.delete(term)
    db.commit()

    log_audit(
        db,
        action="TERMINOLOGY_DELETED",
        entity_type="terminology",
        entity_id=str(term_id),
        details={"term": t_text}
    )
    return {"message": f"Terminology rule '{t_text}' deleted"}
