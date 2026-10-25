import json
from sqlalchemy.orm import Session
from backend.app.models import AuditLog

def log_audit(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: str,
    performed_by: str = "User",
    details: dict = None
):
    details_str = json.dumps(details) if details else None
    audit_entry = AuditLog(
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id),
        performed_by=performed_by,
        details=details_str
    )
    db.add(audit_entry)
    db.commit()
    return audit_entry
