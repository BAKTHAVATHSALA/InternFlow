import os
import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import Column, String, DateTime, text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Session

from db.database import get_db, Base
from models.users import User
from models.referrals import Referral
from models.applications import Application
from models.onboarding import JoiningForm, NDARecord
from models.meta import MagicLinkToken, SLATracking, AuditLog, Notification, OTPVerification
from models.ai import AILog

from services.auth_service import get_password_hash, verify_password, create_access_token
from middleware.auth_middleware import get_current_user
from schemas.auth_schemas import UserSignup, UserLogin, SendOTP, VerifyOTP, SendMagicLink, Token, UserRole
from config.sla_config import OTP_EXPIRY, MAGIC_LINK_EXPIRY, ACCESS_AFTER_COMPLETION

router = APIRouter(prefix="/auth", tags=["auth"])

# --- HELPERS ---
def generate_otp():
    return str(random.randint(100000, 999999))

# --- ROUTES ---

@router.post("/signup")
def signup(data: UserSignup, db: Session = Depends(get_db)):
    if data.role == UserRole.INTERN:
        raise HTTPException(status_code=400, detail="Interns cannot sign up directly. They must be referred.")
    
    db_user = db.query(User).filter(User.email == data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        name=data.name,
        email=data.email,
        password_hash=get_password_hash(data.password),
        role=data.role
    )
    db.add(new_user)
    db.commit()
    return {"message": f"Successfully registered as {data.role}"}

@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if user.role == UserRole.INTERN:
        # Check if access has expired post completion/rejection
        app = db.query(Application).filter(Application.user_id == user.id).first()
        if app and app.status in ["completed", "rejected"]:
            if datetime.utcnow() > app.updated_at.replace(tzinfo=None) + timedelta(seconds=ACCESS_AFTER_COMPLETION):
                raise HTTPException(status_code=403, detail="Access expired for this internship.")

    access_token = create_access_token(data={"user_id": str(user.id), "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": str(user.id), "name": user.name, "email": user.email, "role": user.role}
    }

@router.post("/send-otp")
def send_otp(data: SendOTP, db: Session = Depends(get_db)):
    # Validate intern is referred
    referral = db.query(Referral).filter(Referral.candidate_email == data.email).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Email not found in referral system.")
    
    otp = generate_otp()
    otp_record = OTPVerification(
        email=data.email,
        otp=otp,
        expires_at=datetime.utcnow() + timedelta(seconds=OTP_EXPIRY)
    )
    db.add(otp_record)
    db.commit()
    
    # MOCK EMAIL
    print(f"EMAIL TO {data.email}: Your InternFlow OTP is {otp}. Valid for {OTP_EXPIRY//60} mins.")
    return {"message": "OTP sent to your email."}

@router.post("/verify-otp", response_model=Token)
def verify_otp(data: VerifyOTP, db: Session = Depends(get_db)):
    otp_record = db.query(OTPVerification).filter(
        OTPVerification.email == data.email,
        OTPVerification.otp == data.otp,
        OTPVerification.is_used == False,
        OTPVerification.expires_at > datetime.utcnow()
    ).first()
    
    if not otp_record:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")
    
    otp_record.is_used = True
    
    # Create or Get Intern User
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        referral = db.query(Referral).filter(Referral.candidate_email == data.email).first()
        user = User(
            name=referral.candidate_name,
            email=data.email,
            password_hash="OTP_USER", # No password needed
            role=UserRole.INTERN
        )
        db.add(user)
        db.flush()
        
        # Create initial application
        new_app = Application(
            user_id=user.id,
            job_id=referral.job_id,
            referral_id=referral.id,
            status="applied"
        )
        db.add(new_app)
    
    db.commit()
    db.refresh(user)
    
    access_token = create_access_token(data={"user_id": str(user.id), "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": str(user.id), "name": user.name, "email": user.email, "role": user.role}
    }

@router.post("/send-magic-link")
def send_magic_link(data: SendMagicLink, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email, User.role == UserRole.INTERN).first()
    if not user:
        raise HTTPException(status_code=404, detail="Intern user not found.")
    
    # Check if onboarded
    app = db.query(Application).filter(Application.user_id == user.id).first()
    if not app or app.status not in ["onboarded", "tasks_assigned", "learning_in_progress", "project_submitted", "approved"]:
        raise HTTPException(status_code=403, detail="Magic links are only for onboarded interns.")

    token = os.urandom(32).hex()
    magic_token = MagicLinkToken(
        user_id=user.id,
        application_id=app.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(seconds=MAGIC_LINK_EXPIRY)
    )
    db.add(magic_token)
    db.commit()
    
    # MOCK EMAIL
    print(f"EMAIL TO {data.email}: Magic Login Link: http://localhost:8000/auth/magic-login?token={token}")
    return {"message": "Magic link sent to your email."}

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    # JWT is stateless, so we just return success. 
    # Frontend will delete the token from local storage.
    return {"message": "Logged out successfully"}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }

@router.post("/resend-otp")
def resend_otp(data: SendOTP, db: Session = Depends(get_db)):
    referral = db.query(Referral).filter(Referral.candidate_email == data.email).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Email not found in referral system.")
    
    # Invalidate old OTPs for this email
    db.query(OTPVerification).filter(
        OTPVerification.email == data.email,
        OTPVerification.is_used == False
    ).update({"is_used": True})
    
    otp = generate_otp()
    otp_record = OTPVerification(
        email=data.email,
        otp=otp,
        expires_at=datetime.utcnow() + timedelta(seconds=OTP_EXPIRY)
    )
    db.add(otp_record)
    db.commit()
    
    print(f"RESEND EMAIL TO {data.email}: New OTP is {otp}")
    return {"message": "A new OTP has been sent."}

@router.get("/validate-magic-token")
def validate_magic_token(token: str, db: Session = Depends(get_db)):
    magic_record = db.query(MagicLinkToken).filter(
        MagicLinkToken.token == token,
        MagicLinkToken.is_used == False,
        MagicLinkToken.expires_at > datetime.utcnow()
    ).first()
    
    if not magic_record:
        return {"valid": False}
        
    return {"valid": True, "user_id": str(magic_record.user_id)}

@router.get("/magic-login", response_model=Token)
def magic_login(token: str, db: Session = Depends(get_db)):
    magic_record = db.query(MagicLinkToken).filter(
        MagicLinkToken.token == token,
        MagicLinkToken.is_used == False,
        MagicLinkToken.expires_at > datetime.utcnow()
    ).first()
    
    if not magic_record:
        raise HTTPException(status_code=401, detail="Invalid or expired magic link")
    
    magic_record.is_used = True
    user = db.query(User).filter(User.id == magic_record.user_id).first()
    db.commit()
    
    access_token = create_access_token(data={"user_id": str(user.id), "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": str(user.id), "name": user.name, "email": user.email, "role": user.role}
    }
