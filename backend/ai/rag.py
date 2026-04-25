import os
from google import genai
from dotenv import load_dotenv

# Load .env from the parent directory (backend/)
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path=env_path)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def query_compliance_bot(query: str, policy_context: str = ""):
    prompt = f"""
    You are the InternFlow Compliance Chatbot. Answer questions based on internal policies.
    Policy Context: {policy_context}
    
    Question: {query}
    """
    
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        contents=prompt
    )
    return response.text
