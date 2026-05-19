from sqlalchemy.orm import Session
from models import *
import random
import uuid

class SeedService:
    @staticmethod
    def bulk_insert(session: Session, model, data_list):
        session.bulk_insert_mappings(model, data_list)
        session.commit()

    @staticmethod
    def get_random_ids(session: Session, model, limit=None):
        query = session.query(model.id)
        if limit:
            return [r[0] for r in query.limit(limit).all()]
        return [r[0] for r in query.all()]
    
    @staticmethod
    def create_lms_modules_for_all(session: Session, job_ids):
        modules = []
        for job_id in job_ids:
            modules.append({
                "id": uuid.uuid4(),
                "job_id": job_id,
                "title": "Welcome to the Team",
                "type": "video",
                "description": "Introduction to company culture",
                "file_url": "https://youtube.com/watch?v=intro",
                "duration_minutes": 15,
                "sort_order": 1
            })
            modules.append({
                "id": uuid.uuid4(),
                "job_id": job_id,
                "title": "Technical Onboarding",
                "type": "pdf",
                "description": "Setting up your environment",
                "file_url": "https://cdn.internflow.ai/onboarding.pdf",
                "duration_minutes": 30,
                "sort_order": 2
            })
        return modules
