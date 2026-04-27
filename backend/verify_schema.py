import os
from sqlalchemy import create_engine, inspect
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
inspector = inspect(engine)

def verify():
    print("Checking Database Schema...")
    tables = inspector.get_table_names()
    print(f"Tables found: {tables}")
    
    if 'applications' in tables:
        columns = inspector.get_columns('applications')
        for col in columns:
            if col['name'] == 'status':
                print(f"SUCCESS: Column 'status' type is {col['type']}")
    else:
        print("ERROR: 'applications' table not found!")

if __name__ == "__main__":
    verify()
