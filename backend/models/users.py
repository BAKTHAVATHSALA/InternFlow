from sqlalchemy import Column, Integer, String, Enum
from db.database import Base
import enum

class UserRole(str, enum.Enum):
    HR = "hr"
    INTERN = "intern"
    MANAGER = "manager"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.INTERN)
