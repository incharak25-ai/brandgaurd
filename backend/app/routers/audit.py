from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import AuditLog
from backend.app.schemas import AuditLogResponse

router = APIRouter(prefix="/audit", tags=["Audit History"])

@router.get("/", response_model=List[AuditLogResponse])
def get_audit_logs(
    action: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    performed_by: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if performed_by:
        query = query.filter(AuditLog.performed_by == performed_by)

    return query.order_by(AuditLog.timestamp.desc()).offset(offset).limit(limit).all()
