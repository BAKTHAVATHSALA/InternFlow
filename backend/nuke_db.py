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

# Clean up DATABASE_URL if it's using postgres://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

def nuke_db():
    print("WARNING: Nuking Database...")
    
    commands = [
        "DROP TABLE IF EXISTS applications CASCADE;",
        "DROP TABLE IF EXISTS jobs CASCADE;",
        "DROP TABLE IF EXISTS users CASCADE;",
        "DROP TYPE IF EXISTS applicationstatus CASCADE;"
    ]
    
    with engine.connect() as connection:
        trans = connection.begin()
        try:
            for command in commands:
                print(f"Executing: {command}")
                connection.execute(text(command))
            trans.commit()
            print("Database Cleared Successfully!")
        except Exception as e:
            trans.rollback()
            print(f"Error nuking database: {e}")

if __name__ == "__main__":
    nuke_db()
