from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
print("SYSTEM: Initializing InternFlow API...")
from db.database import engine, Base
import models.users
import models.jobs
import models.applications
import models.referrals
import models.ai
import models.onboarding
import models.tasks
import models.meta
from routes import auth, applications, jobs

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="InternFlow v5.0 API - Production Grade Auth")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(jobs.router)

@app.get("/")
def read_root():
    return {
        "message": "InternFlow v5.0 LIVE - AI READY",
        "status": "Healthy",
        "auth_system": "RBAC + OTP + Magic Link"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
