from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from models.applications import Application, ApplicationStatus
from models.users import User
from routes.auth import get_current_user
from services import app_service
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/applications", tags=["applications"])

class ApplicationCreate(BaseModel):
    job_id: int

class ApplicationUpdateStatus(BaseModel):
    status: ApplicationStatus

@router.post("/", status_code=status.HTTP_201_CREATED)
def apply(app_data: ApplicationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if user already applied
    existing = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.job_id == app_data.job_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this job")
    
    return app_service.create_application(db, current_user.id, app_data.job_id)

@router.get("/")
def list_applications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "hr" or current_user.role == "manager":
        return app_service.get_applications(db)
    else:
        return db.query(Application).filter(Application.user_id == current_user.id).all()

@router.patch("/{app_id}/status")
def update_status(app_id: int, status_data: ApplicationUpdateStatus, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "hr" and current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Not authorized to update status")
    
    db_application = app_service.update_application_status(db, app_id, status_data.status)
    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")
    return db_application

@router.get("/ranked/{job_id}")
def get_ranked(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "hr" and current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Not authorized to view ranked list")
    
    return app_service.get_ranked_applications(db, job_id)
