from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.seed_data import seed_database

router = APIRouter(prefix="/seed", tags=["Demo Data Seeding"])

@router.post("/")
def run_seed(
    force: bool = Query(False, description="Clear and reseed demo data"),
    db: Session = Depends(get_db)
):
    result = seed_database(db, force=force)
    return result
