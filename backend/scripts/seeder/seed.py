import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import uuid
import random

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import *
from factories import *
from services import SeedService

# Configuration
DATABASE_URL = "postgresql://postgres:fawvQSYmOlrXn4Yr@db.qzlzvtssbdneecnlizfd.supabase.co:5432/postgres?sslmode=require"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def seed_database():
    session = SessionLocal()
    print("🚀 Starting InternFlow Database Seeding...")
    
    try:
        # 0. CLEAR EXISTING DATA
        print("🧹 Clearing existing data...")
        session.execute(text("TRUNCATE TABLE audit_trail, notifications, rewards, projects, lms_progress, lms_modules, mentor_assignments, documents, ai_scores, applications, referrals, referral_quotas, jobs, sessions, otp_tokens, users CASCADE;"))
        session.commit()
        # 1. FIXED ROLES
        print("👤 Creating fixed demo users...")
        fixed_users = [
            {"id": uuid.uuid4(), "email": "hr@internflow.ai", "name": "HR Admin", "role": "hr", "status": "active", "department": "HR", "password_hash": PASSWORDS["hr@internflow.ai"]},
            {"id": uuid.uuid4(), "email": "employee@internflow.ai", "name": "Main Employee", "role": "employee", "status": "active", "department": "Engineering", "password_hash": PASSWORDS["employee@internflow.ai"]},
            {"id": uuid.uuid4(), "email": "intern@internflow.ai", "name": "Demo Intern", "role": "intern", "status": "active", "department": "Engineering", "password_hash": PASSWORDS["intern@internflow.ai"]},
        ]
        
        # 2. GENERATE USERS
        print("👥 Generating users (HR, Employees, Mentors, Interns)...")
        hr_users = [{**create_fake_user("hr", "HR"), "password_hash": PASSWORDS["default"]} for _ in range(2)]
        employees = [{**create_fake_user("employee"), "password_hash": PASSWORDS["default"]} for _ in range(15)]
        
        mentors = []
        for dept in DEPARTMENTS:
            for i in range(1, 4):
                email = f"mentor.{dept.lower()}{i}@internflow.ai"
                mentors.append({
                    "id": uuid.uuid4(),
                    "email": email,
                    "name": f"{dept} Mentor {i}",
                    "role": "mentor",
                    "status": "active",
                    "department": dept,
                    "employee_id": f"MNT-{dept[:3].upper()}-{i}",
                    "password_hash": PASSWORDS.get(email, PASSWORDS["default"])
                })
        
        interns = [{**create_fake_user("intern"), "password_hash": PASSWORDS["default"]} for _ in range(80)]
        
        all_users = fixed_users + hr_users + employees + mentors + interns
        SeedService.bulk_insert(session, User, all_users)
        
        # 3. JOBS
        print("💼 Creating department jobs...")
        hr_admin_id = next(u["id"] for u in all_users if u["role"] == "hr")
        all_jobs = []
        for dept, titles in JOB_TITLES.items():
            for title in titles:
                all_jobs.append(create_fake_job(dept, title, hr_admin_id))
        
        SeedService.bulk_insert(session, Job, all_jobs)
        
        # 4. REFERRALS & QUOTAS
        print("🔗 Generating referrals and quotas...")
        all_referrals = []
        all_quotas = []
        employee_ids = [u["id"] for u in all_users if u["role"] == "employee"]
        intern_ids = [u["id"] for u in all_users if u["role"] == "intern"]
        job_ids = [j["id"] for j in all_jobs]
        
        for emp_id in employee_ids:
            all_quotas.append({
                "id": uuid.uuid4(),
                "employee_id": emp_id,
                "cycle_label": "2024-Q2",
                "total_slots": 5,
                "used_slots": 0,
                "resets_at": datetime.utcnow() + timedelta(days=30)
            })
            
            # Create some referrals for each employee
            num_refs = random.randint(1, 4)
            for _ in range(num_refs):
                if not intern_ids: break
                target_intern_id = intern_ids.pop()
                target_job_id = random.choice(job_ids)
                all_referrals.append({
                    "id": uuid.uuid4(),
                    "employee_id": emp_id,
                    "intern_id": target_intern_id,
                    "job_id": target_job_id,
                    "status": random.choice(["applied", "screened", "onboarded", "rejected"]),
                    "intern_name": fake.name(),
                    "intern_email": fake.email(),
                    "created_at": datetime.utcnow() - timedelta(days=random.randint(5, 40))
                })
        
        SeedService.bulk_insert(session, ReferralQuota, all_quotas)
        SeedService.bulk_insert(session, Referral, all_referrals)
        
        # 5. APPLICATIONS & AI SCORES
        print("📝 Processing applications and AI screening...")
        all_apps = []
        for ref in all_referrals:
            all_apps.append(create_fake_application(ref["intern_id"], ref["job_id"], ref["id"]))
        
        # Add some direct applications
        for _ in range(20):
            if not intern_ids: break
            target_intern_id = intern_ids.pop()
            all_apps.append(create_fake_application(target_intern_id, random.choice(job_ids)))
            
        SeedService.bulk_insert(session, Application, all_apps)
        
        app_ids = [a["id"] for a in all_apps]
        all_ai_scores = [create_fake_ai_score(aid) for aid in app_ids]
        SeedService.bulk_insert(session, AIScore, all_ai_scores)
        
        # 6. ONBOARDING & MENTORS
        print("🚢 Onboarding interns and assigning mentors...")
        onboarded_apps = [a for a in all_apps if a["status"] == "onboarded"]
        all_assignments = []
        all_docs = []
        
        for app in onboarded_apps:
            # Find a mentor in the same department
            job = next(j for j in all_jobs if j["id"] == app["job_id"])
            dept_mentors = [m["id"] for m in mentors if m["department"] == job["department"]]
            if dept_mentors:
                all_assignments.append({
                    "id": uuid.uuid4(),
                    "mentor_id": random.choice(dept_mentors),
                    "intern_id": app["intern_id"],
                    "application_id": app["id"]
                })
            
            # Docs
            all_docs.append({
                "id": uuid.uuid4(),
                "intern_id": app["intern_id"],
                "application_id": app["id"],
                "type": "nda",
                "signed_at": datetime.utcnow() - timedelta(days=5),
                "signature_text": f"{app['first_name']} {app['last_name']}"
            })

        SeedService.bulk_insert(session, MentorAssignment, all_assignments)
        SeedService.bulk_insert(session, Document, all_docs)
        
        # 7. LMS
        print("📚 Seeding LMS modules and progress...")
        lms_mods = SeedService.create_lms_modules_for_all(session, job_ids)
        SeedService.bulk_insert(session, LMSModule, lms_mods)
        
        all_lms_progress = []
        for app in onboarded_apps:
            # Assign first module as completed for all onboarded
            mod_id = lms_mods[0]["id"]
            all_lms_progress.append({
                "id": uuid.uuid4(),
                "intern_id": app["intern_id"],
                "module_id": mod_id,
                "completed": True,
                "progress_pct": 100,
                "completed_at": datetime.utcnow() - timedelta(days=2)
            })
            
        SeedService.bulk_insert(session, LMSProgress, all_lms_progress)
        
        # 8. NOTIFICATIONS & AUDIT
        print("🔔 Generating final notifications and audit logs...")
        all_notifs = []
        for u in all_users[:50]:
            all_notifs.append({
                "id": uuid.uuid4(),
                "user_id": u["id"],
                "title": "Welcome to InternFlow",
                "message": "Your account has been successfully set up.",
                "type": "general"
            })
        SeedService.bulk_insert(session, Notification, all_notifs)
        
        print("✅ Seeding completed successfully!")

    except Exception as e:
        session.rollback()
        print(f"❌ Error during seeding: {str(e)}")
        raise e
    finally:
        session.close()

if __name__ == "__main__":
    seed_database()
