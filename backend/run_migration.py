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

def run_migration(file_name):
    print(f"SYSTEM: Running migration {file_name}...")
    migration_path = os.path.join(os.path.dirname(__file__), "db", "migrations", file_name)
    
    with open(migration_path, "r") as f:
        sql_content = f.read()

    # Split by semicolon to handle statements that can't run in transactions (like ALTER TYPE)
    # This is a naive split but works for our script structure
    commands = [cmd.strip() for cmd in sql_content.split(";") if cmd.strip() and not cmd.strip().startswith("/*")]

    with engine.connect() as connection:
        for command in commands:
            try:
                print(f"Executing: {command[:50]}...")
                connection.execute(text(command))
                # Commit after each command to handle ALTER TYPE restriction
                connection.commit()
            except Exception as e:
                print(f"SYSTEM: Warning/Error on command: {e}")

    print("SYSTEM: Migration Finished.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        run_migration(sys.argv[1])
    else:
        print("Usage: python run_migration.py <migration_file.sql>")
