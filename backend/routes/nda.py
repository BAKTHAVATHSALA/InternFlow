from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from db.database import get_db
from models.others import NDA
from models.applications import Application, ApplicationStatus
from models.users import User
from routes.auth import get_current_user
from datetime import datetime
from pydantic import BaseModel

router = APIRouter(prefix="/nda", tags=["nda"])

class NDASign(BaseModel):
    application_id: int

@router.post("/sign")
def sign_nda(nda_data: NDASign, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if application exists and belongs to user
    db_application = db.query(Application).filter(
        Application.id == nda_data.application_id,
        Application.user_id == current_user.id
    ).first()
    
    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if db_application.status != ApplicationStatus.SELECTED:
        raise HTTPException(status_code=400, detail="Application must be in SELECTED status to sign NDA")
    
    # Create or update NDA
    db_nda = db.query(NDA).filter(NDA.application_id == nda_data.application_id).first()
    if not db_nda:
        db_nda = NDA(application_id=nda_data.application_id)
        db.add(db_nda)
    
    db_nda.signed = True
    db_nda.signed_at = datetime.utcnow()
    db_nda.ip_address = request.client.host
    
    # Update application status to ONBOARDED
    db_application.status = ApplicationStatus.ONBOARDED
    
    db.commit()
    db.refresh(db_nda)
    return {"message": "NDA signed successfully", "nda_id": db_nda.id}

@router.get("/status/{application_id}")
def get_nda_status(application_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_nda = db.query(NDA).filter(NDA.application_id == application_id).first()
    if not db_nda:
        return {"signed": False}
    return {"signed": db_nda.signed, "signed_at": db_nda.signed_at}
