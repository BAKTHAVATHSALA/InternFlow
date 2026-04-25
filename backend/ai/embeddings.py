import os
from google import genai
import numpy as np
from dotenv import load_dotenv

# Load .env from the parent directory (backend/)
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path=env_path)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def get_embedding(text: str):
    response = client.models.embed_content(
        model="text-embedding-004",
        contents=text
    )
    return response.embeddings[0].values

def cosine_similarity(v1, v2):
    v1 = np.array(v1)
    v2 = np.array(v2)
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

def calculate_hybrid_score(resume_data: dict, job_requirements: dict):
    # 0.5 * Semantic Match
    # 0.3 * Skill Match
    # 0.2 * Experience Weight
    
    # 1. Semantic Match (Placeholder for now, can use embeddings if needed)
    semantic_score = 0.8 
    
    # 2. Skill Match
    candidate_skills = [s['name'].lower() for s in resume_data.get('skills', [])]
    required_skills = [s.lower() for s in job_requirements.get('required_skills', [])]
    
    if not required_skills:
        skill_score = 1.0
    else:
        matches = len(set(candidate_skills) & set(required_skills))
        skill_score = matches / len(required_skills)
    
    # 3. Experience Weight
    cand_exp = resume_data.get('experience_years', 0)
    req_exp = job_requirements.get('min_experience', 0)
    
    if cand_exp >= req_exp:
        exp_score = 1.0
    else:
        exp_score = cand_exp / req_exp if req_exp > 0 else 1.0
        
    overall_score = (0.5 * semantic_score) + (0.3 * skill_score) + (0.2 * exp_score)
    
    return {
        "overall": round(overall_score * 100, 2),
        "semantic": round(semantic_score * 100, 2),
        "skill": round(skill_score * 100, 2),
        "experience": round(exp_score * 100, 2)
    }
