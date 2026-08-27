import os

base_dir = r"D:\Apoliums 3\JS-Mentor-Backend\JS-Mentor"
auth_service_path = os.path.join(base_dir, "app", "services", "auth_service.py")

with open(auth_service_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the strict trainer-only check
old_check = """    # 2. Enforce Trainer-only login
    if user.role != models.UserRole.TRAINER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Login is restricted to trainers only. Students must use Google Sign-In."
        )"""

new_check = """    # 2. Enforce Trainer/Admin-only login
    if user.role not in [models.UserRole.TRAINER, getattr(models.UserRole, "ADMIN", "ADMIN")]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Login is restricted to authorized personnel only. Students must use Google Sign-In."
        )"""

if old_check in content:
    content = content.replace(old_check, new_check)
    with open(auth_service_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed auth_service.py!")
else:
    print("Could not find the target code to replace.")
