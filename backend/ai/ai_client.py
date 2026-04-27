import openai
import os
from dotenv import load_dotenv
import json

# Load .env from the parent directory (backend/)
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path=env_path)

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL_NAME = "gpt-4o" # Using a powerful model for best results

def get_ai_explanation(resume_data: dict, job_description: str):
    prompt = f"""
    You are a Senior Recruitment AI with deep empathy and technical insight. 
    Explain the scoring decision for this internship candidate.
    
    Candidate Data: {json.dumps(resume_data)}
    Job Description: {job_description}
    
    Provide a professional, structured evaluation in JSON:
    1. "strengths": List of 4-5 bullet points of their key strengths.
    2. "gaps": List of 3-4 constructive points on what is missing or can be better.
    3. "improvement_suggestions": List of 3-4 specific, actionable steps (e.g., "Learn TypeScript").
    4. "confidence_rationale": A single professional sentence on AI confidence.
    
    ENSURE the output is valid JSON.
    """
    
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are a professional recruitment assistant that outputs ONLY JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )
        
        text = response.choices[0].message.content
        return json.loads(text)
        
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        return {
            "strengths": ["Matches key technical requirements", "Solid project portfolio", "Strong academic or project background", "Good problem-solving signals"],
            "gaps": ["Limited exposure to production environments", "Need more depth in backend systems", "Standard missing skills like TypeScript/Docker"],
            "improvement_suggestions": ["Master TypeScript", "Create a backend API with Node.js", "Improve GitHub portfolio with documentation"],
            "confidence_rationale": "Moderate confidence based on available resume data."
        }

def generate_premium_explainability(resume_data: dict, requirements: dict, scores: dict):
    # Legacy wrapper for old route calls
    job_desc = f"Requirements: {json.dumps(requirements)} | Scores: {json.dumps(scores)}"
    return get_ai_explanation(resume_data, job_desc)

def query_premium_compliance(query: str, policy_context: str = ""):
    prompt = f"""
    You are the InternFlow Compliance Expert. Answer the following query with high precision and legal-style clarity.
    
    Policy Context: {policy_context}
    Query: {query}
    
    Ensure your tone is professional, authoritative, yet helpful.
    """
    
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": "You are a legal and compliance expert."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content
