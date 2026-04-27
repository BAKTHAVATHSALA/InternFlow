from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.database import get_db
from models.applications import Application, ApplicationStatus
from models.users import User
from routes.auth import get_current_user
from services import app_service
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import joinedload

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
    
    print(f"DEBUG: User {current_user.id} applying for Job {app_data.job_id}")
    return app_service.create_application(db, current_user.id, app_data.job_id)

@router.get("/")
def list_applications(job_id: int = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Application).options(joinedload(Application.job))
    
    # If job_id is provided, filter applications
    if job_id:
        query = query.filter(Application.job_id == job_id)
        
    # Interns only see their own, HR/Managers see all (filtered by job if provided)
    if current_user.role == "intern":
        apps = query.filter(Application.user_id == current_user.id).all()
        print(f"DEBUG: Found {len(apps)} applications for Intern {current_user.id}")
        return apps
        
    print(f"DEBUG: HR {current_user.id} viewing all {query.count()} applications")
    return query.all()

@router.get("/analytics/{job_id}")
def get_job_analytics(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    apps = db.query(Application).filter(Application.job_id == job_id).all()
    
    total = len(apps)
    reviewed = len([a for a in apps if a.status != 'applied'])
    selected = len([a for a in apps if a.status == 'selected'])
    closed = len([a for a in apps if a.status == 'closed'])
    
    scores = [a.overall_score for a in apps if a.overall_score is not None]
    avg_score = sum(scores) / len(scores) if scores else 0
    
    return {
        "total": total,
        "reviewed": reviewed,
        "selected": selected,
        "closed": closed,
        "avg_score": round(avg_score, 1),
        "selection_rate": f"{round((selected/total)*100, 1)}%" if total > 0 else "0%"
    }

@router.patch("/{app_id}/status")
def update_status(app_id: int, status_data: ApplicationUpdateStatus, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from models.users import UserRole
    print(f"ROUTE DEBUG: User {current_user.id} ({current_user.role}) attempting to update application {app_id} to {status_data.status}")
    
    if current_user.role not in [UserRole.HR, UserRole.MANAGER]:
        print(f"ROUTE DEBUG: Permission Denied for role {current_user.role}")
        raise HTTPException(status_code=403, detail="Not authorized to update status. HR or Manager role required.")
    
    db_application = app_service.update_application_status(db, app_id, status_data.status)
    if not db_application:
        print(f"ROUTE DEBUG: Application {app_id} not found")
        raise HTTPException(status_code=404, detail="Application not found")
    
    print(f"ROUTE DEBUG: Success! Status is now {db_application.status}")
    return db_application

@router.get("/ranked/{job_id}")
def get_ranked(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "hr" and current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Not authorized to view ranked list")
    
    return app_service.get_ranked_applications(db, job_id)

class NDASign(BaseModel):
    application_id: int

@router.post("/sign-nda")
def sign_nda(nda_data: NDASign, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    print(f"DEBUG: Intern {current_user.id} signing NDA for app {nda_data.application_id}")
    db_application = db.query(Application).filter(
        Application.id == nda_data.application_id,
        Application.user_id == current_user.id
    ).first()
    
    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Update status to ONBOARDED
    db_application.status = "onboarded"
    db.commit()
    print(f"DEBUG: Onboarding successful for app {nda_data.application_id}")
    return {"message": "NDA signed and onboarded successfully"}
