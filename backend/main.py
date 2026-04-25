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

app = FastAPI(title="InternFlow v3.0 API")

app.include_router(auth.router)
app.include_router(applications.router)
app.include_router(jobs.router)
app.include_router(nda.router)
app.include_router(ai.router)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to InternFlow v3.0 API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
