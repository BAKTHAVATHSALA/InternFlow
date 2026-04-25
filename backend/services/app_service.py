from sqlalchemy.orm import Session
from models.applications import Application, ApplicationStatus
from models.jobs import Job
from models.users import User
from datetime import datetime

def create_application(db: Session, user_id: int, job_id: int):
    # Basic application creation
    db_application = Application(
        user_id=user_id,
        job_id=job_id,
        status=ApplicationStatus.APPLIED
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

def get_applications(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Application).offset(skip).limit(limit).all()

def get_application_by_id(db: Session, app_id: int):
    return db.query(Application).filter(Application.id == app_id).first()

def update_application_status(db: Session, app_id: int, status: ApplicationStatus):
    db_application = get_application_by_id(db, app_id)
    if db_application:
        db_application.status = status
        db.commit()
        db.refresh(db_application)
    return db_application

def get_ranked_applications(db: Session, job_id: int):
    return db.query(Application).filter(Application.job_id == job_id).order_by(Application.overall_score.desc()).all()
