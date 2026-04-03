import json
import datetime
from config import COMFORTABLE_QUEUE, SERVING_RATE, EXTRA_COUNTER_BOOST
from database import conn

def calculate_wait_time(people, extra_counters=1):
    effective_rate = SERVING_RATE + (extra_counters - 1) * EXTRA_COUNTER_BOOST
    excess = max(0, people - COMFORTABLE_QUEUE)
    wait_time = excess / effective_rate
    return round(wait_time)

def get_user(mobile):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE mobile = ?", (mobile,))
    row = cursor.fetchone()
    if row:
        return {
            "id": row[0],
            "name": row[1],
            "mobile": row[2],
            "college": row[3],
            "mess": row[4],
            "role": row[5]
        }
    return None

def register_user(name, mobile, college, mess, role="student"):
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (name, mobile, college, mess, role) VALUES (?, ?, ?, ?, ?)",
            (name, mobile, college, mess, role)
        )
        conn.commit()
        return True
    except:
        return False

def estimate_today_count(history):
    today = datetime.datetime.now().strftime("%A").lower()
    same_day_data = [d["people"] for d in history if d["day"] == today]
    if not same_day_data:
        return 50
    return sum(same_day_data) // len(same_day_data)

def get_crowd_level(people):
    if people < 30:
        return "Low"
    elif people < 70:
        return "Moderate"
    else:
        return "High"

def get_recommended_time(wait_time):
    if wait_time == 0:
        return "🟢 Walk in directly, no wait!"
    elif wait_time <= 5:
        return f"⚠️ Come in {wait_time} mins for shorter wait"
    else:
        return f"⚠️ Avoid peak — try after {wait_time} mins"