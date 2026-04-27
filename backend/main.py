from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import engine, Base
import models.users
import models.jobs
import models.applications
import models.others
from routes import auth, applications, jobs, nda, ai

# Create tables
Base.metadata.create_all(bind=engine)

print("SYSTEM: Initializing InternFlow API...")
app = FastAPI(title="InternFlow v3.0 API")

print("SYSTEM: Including Auth Router...")
app.include_router(auth.router)
print("SYSTEM: Including Applications Router...")
app.include_router(applications.router)
print("SYSTEM: Including Jobs Router...")
app.include_router(jobs.router)
print("SYSTEM: Including NDA Router...")
app.include_router(nda.router)
print("SYSTEM: Including AI Router...")
app.include_router(ai.router)

from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi import Depends
from db.database import get_db
from models.applications import Application

class EmergencyNDA(BaseModel):
    application_id: int

@app.get("/emergency-onboard/{app_id}")
def emergency_onboard_get(app_id: int, db: Session = Depends(get_db)):
    print(f"EMERGENCY GET: Onboarding app {app_id}")
    db_app = db.query(Application).filter(Application.id == app_id).first()
    if db_app:
        db_app.status = "onboarded"
        db.commit()
        return {"status": "onboarded", "message": "Success via GET"}
    return {"error": "not found"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "InternFlow v5.0 LIVE - AI READY"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
