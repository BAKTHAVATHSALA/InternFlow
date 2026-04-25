from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from db.database import get_db
from models.users import User
from models.applications import Application
from models.jobs import Job
from routes.auth import get_current_user
from services import file_service, app_service
from ai import gemini_client, embeddings, rag

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/parse/{application_id}")
async def parse_resume(application_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Save file and extract text
    file_path = await file_service.save_upload_file(file)
    text = file_service.extract_text_from_pdf(file_path)
    
    # 2. AI Parse
    resume_data = gemini_client.parse_resume_with_ai(text)
    
    # 3. Update application
    db_application = db.query(Application).filter(Application.id == application_id).first()
    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    db_application.resume_data = resume_data
    db.commit()
    
    return {"resume_data": resume_data}

@router.post("/score/{application_id}")
def score_candidate(application_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_application = db.query(Application).filter(Application.id == application_id).first()
    if not db_application or not db_application.resume_data:
        raise HTTPException(status_code=400, detail="Application or resume data not found")
    
    job = db.query(Job).filter(Job.id == db_application.job_id).first()
    
    # Hybrid Scoring
    scores = embeddings.calculate_hybrid_score(db_application.resume_data, job.requirements)
    
    # Generate Explainability
    explanation = gemini_client.generate_explainability(db_application.resume_data, job.requirements, scores)
    
    # Update DB
    db_application.overall_score = scores['overall']
    db_application.semantic_score = scores['semantic']
    db_application.skill_score = scores['skill']
    db_application.experience_score = scores['experience']
    db_application.explanation = explanation
    
    db.commit()
    return {"scores": scores, "explanation": explanation}

@router.post("/chat")
def compliance_chat(query: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    response = rag.query_compliance_bot(query)
    return {"response": response}
