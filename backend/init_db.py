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

def init_db():
    print("SYSTEM: Reading schema.sql...")
    schema_path = os.path.join(os.path.dirname(__file__), "db", "schema.sql")
    
    with open(schema_path, "r") as f:
        sql_commands = f.read()

    print("SYSTEM: Executing Schema in Supabase...")
    # Split by semicolon but be careful with functions/triggers if any
    # Since we don't have complex blocks yet, we can execute the whole block
    
    with engine.connect() as connection:
        trans = connection.begin()
        try:
            # Execute the entire SQL script
            connection.execute(text(sql_commands))
            trans.commit()
            print("SYSTEM: SUCCESS! Database Schema Created Perfectly.")
        except Exception as e:
            trans.rollback()
            print(f"SYSTEM: ERROR Initializing Database: {e}")

if __name__ == "__main__":
    init_db()
