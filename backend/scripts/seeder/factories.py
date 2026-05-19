import random
from faker import Faker
from datetime import datetime, timedelta
import bcrypt
import uuid

fake = Faker()

DEPARTMENTS = ["Design", "Engineering", "Marketing", "Product", "HR", "Cybersecurity", "Data"]

JOB_TITLES = {
    "Design": ["UI/UX Intern", "Product Design Intern", "Motion Design Intern"],
    "Engineering": ["Backend Intern", "Frontend Intern", "Mobile App Intern"],
    "Marketing": ["Digital Marketing Intern", "SEO Specialist Intern", "Content Writing Intern"],
    "Product": ["PM Intern", "Product Analyst Intern", "Strategist Intern"],
    "HR": ["Recruitment Intern", "People Ops Intern", "Training Intern"],
    "Cybersecurity": ["Security Analyst Intern", "Pentester Intern", "Network Security Intern"],
    "Data": ["Data Analyst Intern", "Machine Learning Intern", "Data Engineering Intern"]
}

TECH_STACKS = {
    "Design": ["Figma", "Adobe XD", "Sketch", "After Effects"],
    "Engineering": ["React", "Node.js", "PostgreSQL", "Docker", "Python", "Swift"],
    "Marketing": ["SEO", "Google Analytics", "Copywriting", "Social Media"],
    "Product": ["Jira", "Agile", "Roadmapping", "SQL"],
    "HR": ["Recruiting", "Employee Relations", "Training", "Excel"],
    "Cybersecurity": ["Kali Linux", "Wireshark", "Nmap", "Metasploit"],
    "Data": ["Python", "Pandas", "Scikit-Learn", "Tableau", "SQL"]
}

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# We'll use specific hashes for the fixed roles
PASSWORDS = {
    "hr@internflow.ai": hash_password("Hr@123"),
    "employee@internflow.ai": hash_password("Emp@123"),
    "intern@internflow.ai": hash_password("Intern@123"),
    "mentor.engineering1@internflow.ai": hash_password("Mentor@123"),
    "default": hash_password("Hexa@2024")
}

def create_fake_user(role, department=None):
    first_name = fake.first_name()
    last_name = fake.last_name()
    email_domain = "internflow.ai"
    
    if not department and role in ["mentor", "employee"]:
        department = random.choice(DEPARTMENTS)
    
    email = f"{first_name.lower()}.{last_name.lower()}@{email_domain}"
    
    return {
        "id": uuid.uuid4(),
        "email": email,
        "name": f"{first_name} {last_name}",
        "role": role,
        "status": "active" if role != "intern" else random.choice(["active", "invited", "offboarded"]),
        "phone": fake.phone_number()[:20],
        "avatar_url": f"https://api.dicebear.com/7.x/avataaars/svg?seed={first_name}",
        "department": department,
        "employee_id": f"EMP-{random.randint(1000, 9999)}" if role in ["hr", "employee", "mentor"] else None,
        "created_at": datetime.utcnow() - timedelta(days=random.randint(60, 200))
    }

def create_fake_job(dept, title, created_by_id):
    return {
        "id": uuid.uuid4(),
        "title": title,
        "department": dept,
        "description": fake.paragraph(),
        "tech_stack": random.sample(TECH_STACKS[dept], k=min(3, len(TECH_STACKS[dept]))),
        "stipend": random.randint(15000, 35000),
        "duration_months": random.choice([3, 6, 12]),
        "mode": random.choice(["Hybrid", "Remote", "Onsite"]),
        "location": fake.city(),
        "is_open": True,
        "max_referrals": random.randint(10, 50),
        "created_by": created_by_id,
        "created_at": datetime.utcnow() - timedelta(days=random.randint(30, 60))
    }

def create_fake_application(intern_id, job_id, referral_id=None):
    first_name = fake.first_name()
    last_name = fake.last_name()
    return {
        "id": uuid.uuid4(),
        "intern_id": intern_id,
        "job_id": job_id,
        "referral_id": referral_id,
        "status": random.choice(["applied", "screened", "offer_pending", "onboarded", "rejected"]),
        "first_name": first_name,
        "last_name": last_name,
        "phone": fake.phone_number()[:20],
        "city": fake.city(),
        "college": f"{fake.company()} University",
        "degree": random.choice(["B.Tech", "M.Tech", "BCA", "MCA"]),
        "cgpa": round(random.uniform(6.5, 9.8), 1),
        "grad_year": random.choice([2023, 2024, 2025]),
        "resume_url": f"https://supabase.co/storage/v1/object/public/resumes/{intern_id}.pdf",
        "github_url": f"https://github.com/{first_name.lower()}{random.randint(10,99)}",
        "portfolio_url": f"https://{first_name.lower()}.design",
        "skills": random.sample(["React", "Python", "SQL", "Git", "Figma", "AWS"], k=3),
        "checklist": {"available_6months": True, "no_conflict": True},
        "applied_at": datetime.utcnow() - timedelta(days=random.randint(10, 30))
    }

def create_fake_ai_score(app_id):
    score = random.randint(40, 95)
    recommendation = "reject"
    if score > 80: recommendation = "strong_pass"
    elif score > 70: recommendation = "pass"
    elif score > 60: recommendation = "borderline"
    
    return {
        "id": uuid.uuid4(),
        "application_id": app_id,
        "overall_score": score,
        "skills_match": random.randint(score-10, min(100, score+10)),
        "experience_fit": random.randint(40, 90),
        "strengths": ["Quick learner", "Relevant project experience"],
        "gaps": ["No production experience"],
        "improvement_tips": ["Focus on testing practices"],
        "recommendation": recommendation,
        "processing_time_ms": random.randint(1500, 4000),
        "processed_at": datetime.utcnow() - timedelta(days=random.randint(1, 10))
    }
