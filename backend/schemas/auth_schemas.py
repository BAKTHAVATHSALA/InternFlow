from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    HR = "hr"
    REFERRER = "referrer"
    MENTOR = "mentor"
    INTERN = "intern"
    ADMIN = "admin"

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SendOTP(BaseModel):
    email: EmailStr

class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str

class SendMagicLink(BaseModel):
    email: EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict
