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
    # Mapping for experience levels
    exp_mapping = {
        'Low (Basics only)': 0.4,
        'Medium (Projects)': 0.7,
        'High (Internship / Real-world)': 1.0
    }
    
    # 1. Semantic Match (Simulated for demo, can be expanded with real embeddings)
    semantic_score = 0.85 
    
    # 2. Skill Match
    candidate_skills = [s['name'].lower() for s in resume_data.get('skills', [])]
    required_skills = [s.lower() for s in job_requirements.get('required_skills', [])]
    
    if not required_skills:
        skill_score = 1.0
    else:
        matches = len(set(candidate_skills) & set(required_skills))
        skill_score = matches / len(required_skills)
    
    # 3. Exposure / Experience Weight
    # We take the job's requirement and map it to a weight
    req_exp_label = job_requirements.get('experience_level', 'Medium (Projects)')
    exp_score = exp_mapping.get(req_exp_label, 0.7)
        
    # Final Formula: 0.5 * semantic + 0.3 * skill + 0.2 * exposure
    overall_score = (0.5 * semantic_score) + (0.3 * skill_score) + (0.2 * exp_score)
    
    return {
        "overall": round(overall_score * 100, 2),
        "semantic": round(semantic_score * 100, 2),
        "skill": round(skill_score * 100, 2),
        "experience": round(exp_score * 100, 2)
    }
