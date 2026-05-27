import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

def init_db():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found. Skipping database initialization.")
        return

    # Check if we are using PostgreSQL
    if not db_url.startswith("postgresql") and not db_url.startswith("postgres"):
        print("DATABASE_URL is not a PostgreSQL URL. Skipping initialization.")
        return

    print("Initializing PostgreSQL database using setup.sql...")
    
    try:
        # Connect to the database
        # psycopg2 handles postgresql:// and postgres:// formats
        conn = psycopg2.connect(db_url)
        conn.autocommit = True  # Necessary for some schema changes or DO blocks
        cur = conn.cursor()

        # Read the setup.sql file
        setup_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "setup.sql")
        if not os.path.exists(setup_path):
            print(f"setup.sql not found at {setup_path}") 
            return

        with open(setup_path, "r", encoding="utf-8") as f:
            sql_script = f.read()

        # Execute the full script
        # psycopg2 allows executing multiple statements in one go
        cur.execute(sql_script)
        
        print("Database initialized successfully.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error initializing database: {e}")

if __name__ == "__main__":
    init_db()
