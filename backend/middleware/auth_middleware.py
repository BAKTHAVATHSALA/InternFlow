from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.auth_service import decode_access_token
from sqlalchemy.orm import Session
from db.database import get_db
from models.users import User
from models.applications import Application
from schemas.auth_schemas import UserRole
from datetime import datetime, timedelta
from config.sla_config import ACCESS_AFTER_COMPLETION

security = HTTPBearer()

def get_current_user(auth: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(auth.credentials)
    if payload is None:
        raise credentials_exception
        
    user_id: str = payload.get("user_id")
    if user_id is None:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
        
    # --- ACCESS CONTROL MIDDLEWARE (TIME-BASED) ---
    if user.role == UserRole.INTERN:
        app = db.query(Application).filter(Application.user_id == user.id).first()
        if app and app.status in ["completed", "rejected"]:
            # Ensure we compare timezone-aware or both naive
            last_update = app.updated_at.replace(tzinfo=None) if app.updated_at.tzinfo else app.updated_at
            if datetime.utcnow() > last_update + timedelta(seconds=ACCESS_AFTER_COMPLETION):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your access to the platform has expired post-internship."
                )
        
    return user

class RoleChecker:
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {self.allowed_roles}"
            )
        return user

# Reusable Guards
is_hr = RoleChecker(["hr", "admin"])
is_mentor = RoleChecker(["mentor", "admin"])
is_referrer = RoleChecker(["referrer", "admin"])
is_intern = RoleChecker(["intern"])
is_any_staff = RoleChecker(["hr", "referrer", "mentor", "admin"])
