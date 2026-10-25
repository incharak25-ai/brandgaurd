from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Claim
from backend.app.schemas import ClaimResponse, ClaimCreate
from backend.app.engine.audit_service import log_audit

router = APIRouter(prefix="/claims", tags=["Claims Register"])

@router.get("/", response_model=List[ClaimResponse])
def list_claims(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Claim)
    if category:
        query = query.filter(Claim.category == category)
    if status:
        query = query.filter(Claim.status == status)
    if search:
        query = query.filter(Claim.claim_text.ilike(f"%{search}%"))
    return query.order_by(Claim.updated_at.desc()).all()

@router.post("/", response_model=ClaimResponse)
def create_claim(data: ClaimCreate, db: Session = Depends(get_db)):
    claim = Claim(
        claim_text=data.claim_text,
        category=data.category,
        substantiation=data.substantiation,
        source_reference=data.source_reference,
        status=data.status,
        confidence_requirement=data.confidence_requirement
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)

    log_audit(
        db,
        action="CLAIM_CREATED",
        entity_type="claim",
        entity_id=str(claim.id),
        details={"claim_text": claim.claim_text, "status": claim.status}
    )
    return claim

@router.get("/{claim_id}", response_model=ClaimResponse)
def get_claim(claim_id: int, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim

@router.put("/{claim_id}", response_model=ClaimResponse)
def update_claim(claim_id: int, data: ClaimCreate, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
        
    claim.claim_text = data.claim_text
    claim.category = data.category
    claim.substantiation = data.substantiation
    claim.source_reference = data.source_reference
    claim.status = data.status
    claim.confidence_requirement = data.confidence_requirement
    db.commit()
    db.refresh(claim)

    log_audit(
        db,
        action="CLAIM_UPDATED",
        entity_type="claim",
        entity_id=str(claim.id),
        details={"claim_text": claim.claim_text, "status": claim.status}
    )
    return claim

@router.delete("/{claim_id}")
def delete_claim(claim_id: int, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    text = claim.claim_text
    db.delete(claim)
    db.commit()

    log_audit(
        db,
        action="CLAIM_DELETED",
        entity_type="claim",
        entity_id=str(claim_id),
        details={"claim_text": text}
    )
    return {"message": f"Claim #{claim_id} deleted"}
