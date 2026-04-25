# InternFlow v3.0 - AI-Powered Internship Management Platform

InternFlow is an AI-driven platform designed to simplify and automate the internship lifecycle—from candidate evaluation to onboarding.

## 🚀 Features (Backend MVP)

- **AI Resume Parsing**: Automated extraction of skills and experience using Gemini 1.5 Flash.
- **Hybrid Scoring Algorithm**: Real-time candidate ranking based on:
  - 50% Semantic Match (Gemini Embeddings)
  - 30% Skill Match
  - 20% Experience Weight
- **Explainable AI (XAI)**: Detailed reasoning for hiring decisions and improvement suggestions for candidates.
- **Onboarding Workflow**: Digital NDA signing simulation.
- **RBAC (Role-Based Access Control)**: Different portals for HR, Managers, and Interns.

## 🛠 Tech Stack

- **Framework**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **ORM**: SQLAlchemy
- **AI Engine**: Google Gemini (via `google-genai` SDK)
- **Authentication**: JWT (JSON Web Tokens)

## ⚙️ Setup Instructions

### 1. Prerequisites
- Python 3.10+
- A Supabase Project
- A Gemini API Key (from Google AI Studio)

### 2. Clone and Install
```bash
git clone <your-repo-url>
cd InternFlow/backend
python -m venv venv
./venv/Scripts/activate  # On Windows
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_random_secret_string
FRONTEND_URL=http://localhost:5173
```

### 4. Run the Application
```bash
python main.py
```
The server will start at `http://localhost:8000`.

## 📖 API Documentation
Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 📁 Project Structure
- `ai/`: Gemini logic, embeddings, and RAG chatbot.
- `db/`: Database connection and session management.
- `models/`: SQLAlchemy table definitions.
- `routes/`: API endpoints (Auth, Jobs, Applications, etc.).
- `services/`: Business logic layer.
- `uploads/`: Temporary storage for resumes.