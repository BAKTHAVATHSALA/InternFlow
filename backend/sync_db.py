import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL not found in .env")
    exit(1)

# Clean up DATABASE_URL if it's using postgres:// (SQLAlchemy needs postgresql://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

def sync_db():
    print("Starting Database Sync...")
    
    commands = [
        # 1. Update Enums (Handle case where it might already exist)
        "ALTER TYPE applicationstatus ADD VALUE IF NOT EXISTS 'processing';",
        
        # 2. Update Jobs Table
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS cutoff_score INTEGER DEFAULT 70;",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS experience_level VARCHAR;",
        
        # 3. Update Applications Table (Ensuring all AI fields are there)
        "ALTER TABLE applications ADD COLUMN IF NOT EXISTS overall_score FLOAT DEFAULT 0.0;",
        "ALTER TABLE applications ADD COLUMN IF NOT EXISTS semantic_score FLOAT DEFAULT 0.0;",
        "ALTER TABLE applications ADD COLUMN IF NOT EXISTS skill_score FLOAT DEFAULT 0.0;",
        "ALTER TABLE applications ADD COLUMN IF NOT EXISTS experience_score FLOAT DEFAULT 0.0;",
        "ALTER TABLE applications ADD COLUMN IF NOT EXISTS confidence_score VARCHAR;",
        "ALTER TABLE applications ADD COLUMN IF NOT EXISTS explanation JSONB;",
        "ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_data JSONB;"
    ]
    
    with engine.connect() as connection:
        trans = connection.begin()
        try:
            for command in commands:
                try:
                    print(f"Executing: {command[:50]}...")
                    connection.execute(text(command))
                except Exception as cmd_err:
                    if "already exists" in str(cmd_err).lower():
                        continue
                    print(f"Command skipped or failed: {cmd_err}")
            
            trans.commit()
            print("Database Sync Complete!")
        except Exception as e:
            trans.rollback()
            print(f"Critical Sync Error: {e}")

if __name__ == "__main__":
    sync_db()
