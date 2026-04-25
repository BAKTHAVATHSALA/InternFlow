import os
from google import genai
from dotenv import load_dotenv
import json

# Load .env from the parent directory (backend/)
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path=env_path)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "gemini-1.5-flash"

def parse_resume_with_ai(resume_text: str):
    prompt = f"""
    You are an AI Resume Parser. Extract the following information from the resume text in JSON format:
    - full_name
    - skills (list of skills with levels: Beginner, Intermediate, Advanced)
    - experience_years (total years)
    - education (highest degree)
    - top_projects (list of 2-3 projects)
    
    Resume Text:
    {resume_text}
    """
    response = client.models.generate_content(model=MODEL_NAME, contents=prompt)
    try:
        text = response.text
        start = text.find('{')
        end = text.rfind('}') + 1
        return json.loads(text[start:end])
    except Exception as e:
        print(f"Error parsing AI response: {e}")
        return {}

def generate_explainability(resume_data: dict, job_data: dict, scores: dict):
    prompt = f"""
    You are an AI Hiring Assistant. Explain the scoring decision for this candidate.
    Candidate: {json.dumps(resume_data)}
    Job Requirements: {json.dumps(job_data)}
    Scores: {json.dumps(scores)}
    
    Provide:
    1. Why-Not-Selected (if score < 70) or Why-Selected
    2. Improvement Suggestions for the candidate.
    3. Confidence Score rationale (High, Medium, Low).
    
    Respond in JSON format.
    """
    response = client.models.generate_content(model=MODEL_NAME, contents=prompt)
    try:
        text = response.text
        start = text.find('{')
        end = text.rfind('}') + 1
        return json.loads(text[start:end])
    except Exception as e:
        return {"error": str(e)}

def generate_smart_notification(status: str, candidate_name: str):
    prompt = f"Generate a short, professional, and friendly notification message for a candidate named {candidate_name} whose application status has changed to {status}."
    response = client.models.generate_content(model=MODEL_NAME, contents=prompt)
    return response.text
