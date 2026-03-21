# ✅ All imports at the top
import json
import datetime
from config import SEATS, AVG_TIME

def calculate_wait_time(people):
    waiting_people = max(0, people - SEATS)
    wait_time = (waiting_people / SEATS) * AVG_TIME
    return round(wait_time)

def load_users():
    try:
        with open("users.json", "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):  # ✅ Handle missing file
        return []

def save_users(data):
    with open("users.json", "w") as f:
        json.dump(data, f, indent=4)

def get_user(phone):
    users = load_users()
    for user in users:
        if user["phone"] == phone:
            return user
    return None

def add_user(user_data):
    users = load_users()
    users.append(user_data)
    save_users(users)

def estimate_today_count(history):
    today = datetime.datetime.now().strftime("%A").lower()
    same_day_data = [d["people"] for d in history if d["day"] == today]

    if not same_day_data:
        return 50
    return sum(same_day_data) // len(same_day_data)

