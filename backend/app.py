from fastapi import FastAPI, Request
import json
from utils import calculate_wait_time, get_user, get_crowd_level, get_recommended_time

app = FastAPI()

# ---------- ADMIN STATE ----------
admin_state = {
    "mess_closed": False,
    "extra_counters": 1
}

# ---------- FILE HANDLING ----------
def read_data():
    try:
        with open("data.json", "r") as file:
            return json.load(file)
    except:
        return {
            "current": {
                "girls": 0,
                "boys": 0,
                "total": 0,
                "wait_time": 0
            }
        }

def write_data(data):
    with open("data.json", "w") as file:
        json.dump(data, file, indent=4)

# ---------- ROUTES ----------
@app.get("/")
def home():
    return {"message": "Mess Backend Running"}

# 🔥 MAIN STATUS API
@app.get("/mess-status")
def get_status():
    data = read_data()

    current = data.get("current", {})
    total = current.get("total", 0)
    wait_time = current.get("wait_time", 0)

    # Admin override
    if admin_state["mess_closed"]:
        return {"message": "🚫 Mess is closed today"}

    return {
        "people": total,
        "estimated_wait": f"{wait_time} minutes",
        "crowd_level": get_crowd_level(total),
        "recommended_time": get_recommended_time(wait_time),
        "counters": admin_state["extra_counters"]
    }

# 🔥 YOLO UPDATE API
@app.get("/update-count")
def update_count(total: int, girls: int = 0, boys: int = 0):
    wait_time = calculate_wait_time(total)

    data = {
        "current": {
            "girls": girls,
            "boys": boys,
            "total": total,
            "wait_time": wait_time
        }
    }

    write_data(data)

    return {
        "message": "Updated",
        "data": data
    }

# 🔥 ADMIN CONTROL
@app.post("/admin-update")
def admin_update(mess_closed: bool, extra_counters: int):
    admin_state["mess_closed"] = mess_closed
    admin_state["extra_counters"] = extra_counters

    return {"message": "Admin updated successfully"}

# ---------- BOT ----------
@app.post("/bot")
async def bot(request: Request):
    try:
        form = await request.form()

        message = form.get("Body", "").lower()
        phone = form.get("From", "unknown")

        print("MESSAGE:", message)
        print("PHONE:", phone)

        user = get_user(phone)

        if not user:
            return {"reply": "👋 Welcome!\nPlease register first.\nSend: Name,College,Mess"}

        data = read_data()
        current = data.get("current", {})

        total = current.get("total", 0)
        wait_time = current.get("wait_time", 0)

        # ✅ FIXED INDENTATION
        if total == 0:
            return {"reply": "⚠️ No data available yet. Please try later."}

        # Admin override
        if admin_state["mess_closed"]:
            return {"reply": "🚫 Mess is closed today"}

        # Commands
        if message.strip() == "status":
            return {
                "reply": f"""🍽️ Mess Status

👥 People: {total}
⏳ Wait Time: {wait_time} min
📊 Crowd: {get_crowd_level(total)}
💡 Suggestion: {get_recommended_time(wait_time)}
🔢 Counters: {admin_state["extra_counters"]}
"""
            }

        elif "help" in message:
            return {
                "reply": """📌 Commands:
1. status → Check mess crowd
2. help → Show commands"""
            }

        else:
            return {"reply": "❓ Type 'help' to see commands"}

    except Exception as e:
        print("🔥 ERROR:", str(e))
        return {"reply": "Server error"}
