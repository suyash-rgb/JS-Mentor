import bcrypt
from app.services.security_service import hash_password

def create_initial_trainer(username, password):
    hashed = hash_password(password)
    # This print ensures you get the EXACT string your code expects
    print(f"INSERT INTO users (username, hashed_password, role) VALUES ('{username}', '{hashed}', 'trainer');")

if __name__ == "__main__":
    create_initial_trainer("chaitanya", "chaitu123")