from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from models.jobs import Job
from models.users import User
from middleware.auth_middleware import get_current_user, is_hr, is_any_staff
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

router = APIRouter(prefix="/jobs", tags=["jobs"])

class JobCreate(BaseModel):
    title: str
    description: str
    requirements: dict
    target_skills: Optional[dict] = {}
    cutoff_score: Optional[float] = 70.0

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_job(job_data: JobCreate, db: Session = Depends(get_db), current_user: User = Depends(is_hr)):
    new_job = Job(
        **job_data.dict(),
        created_by=current_user.id
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.get("/")
def list_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "intern":
        return db.query(Job).filter(Job.is_active == True).all()
    
    return db.query(Job).filter(Job.created_by == current_user.id).all()

@router.get("/{job_id}")
def get_job(job_id: UUID, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
