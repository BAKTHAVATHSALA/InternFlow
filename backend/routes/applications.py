from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from models.applications import Application
from models.users import User
from middleware.auth_middleware import get_current_user, is_hr, is_any_staff
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import joinedload
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/applications", tags=["applications"])

class ApplicationCreate(BaseModel):
    job_id: UUID

class ApplicationUpdateStatus(BaseModel):
    status: str # Use string to match application_status enum

@router.post("/", status_code=status.HTTP_201_CREATED)
def apply(app_data: ApplicationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.job_id == app_data.job_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this job")
    
    new_app = Application(
        user_id=current_user.id,
        job_id=app_data.job_id,
        status="applied"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@router.get("/")
def list_applications(job_id: Optional[UUID] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Application)
    
    if job_id:
        query = query.filter(Application.job_id == job_id)
        
    if current_user.role == "intern":
        return query.filter(Application.user_id == current_user.id).all()
        
    return query.all()

@router.patch("/{app_id}/status")
def update_status(app_id: UUID, status_data: ApplicationUpdateStatus, db: Session = Depends(get_db), current_user: User = Depends(is_any_staff)):
    db_application = db.query(Application).filter(Application.id == app_id).first()
    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db_application.status = status_data.status
    db_application.reviewed_at = datetime.utcnow()
    
    if status_data.status == "selected":
        db_application.selected_at = datetime.utcnow()
        db_application.status = "joining_form_pending" # Kick off onboarding
        
    db.commit()
    db.refresh(db_application)
    return db_application

class NDASign(BaseModel):
    application_id: UUID

@router.post("/sign-nda")
def sign_nda(nda_data: NDASign, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_application = db.query(Application).filter(
        Application.id == nda_data.application_id,
        Application.user_id == current_user.id
    ).first()
    
    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db_application.nda_completed = True
    
    # Check if both are completed to mark as onboarded
    if db_application.joining_form_completed:
        db_application.status = "onboarded"
    else:
        db_application.status = "nda_signed" # Halfway there
        
    db.commit()
    return {"message": "NDA status updated"}
