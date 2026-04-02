from fastapi import FastAPI, Request
import json
from utils import calculate_wait_time, get_user, register_user, get_crowd_level, get_recommended_time

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

# REGISTER
@app.post("/register")
def register(name: str, mobile: str, college: str, role: str = "student"):
    existing = get_user(mobile)
    if existing:
        return {"success": False, "message": "Mobile already registered"}
    success = register_user(name, mobile, college, role)
    if success:
        return {
            "success": True,
            "message": "Registered successfully",
            "user": {"name": name, "mobile": mobile, "college": college, "role": role}
        }
    return {"success": False, "message": "Registration failed"}

# LOGIN
@app.post("/login")
def login(mobile: str):
    user = get_user(mobile)
    if not user:
        return {"verified": False, "message": "User not found"}
    return {
        "verified": True,
        "name": user["name"],
        "college": user["college"],
        "role": user["role"]
    }

# 🔥 STATUS API
@app.get("/mess-status")
def get_status():
    data = read_data()
    current = data.get("current", {})

    total = current.get("total", 0)
    wait_time = current.get("wait_time", 0)

    if admin_state["mess_closed"]:
        return {"message": "🚫 Mess is closed today"}

    return {
        "people": total,
        "estimated_wait": f"{wait_time} minutes",
        "crowd_level": get_crowd_level(total),
        "recommended_time": get_recommended_time(wait_time),
        "counters": admin_state["extra_counters"]
    }

# 🔥 UPDATE COUNT (YOLO)
@app.get("/update-count")
def update_count(total: int, girls: int = 0, boys: int = 0):
    wait_time = calculate_wait_time(total, admin_state["extra_counters"])

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

        message = form.get("Body", "").lower().strip()
        phone = form.get("From", "unknown")

        print("MESSAGE:", message)
        print("PHONE:", phone)

        mobile = phone.replace("whatsapp:", "")
        user = get_user(mobile)

        if not user:
            return {"reply": "👋 Welcome!\nPlease register first.\nSend: Name,College,Mess"}

        data = read_data()
        current = data.get("current", {})

        total = current.get("total", 0)
        wait_time = current.get("wait_time", 0)
        girls = current.get("girls", 0)
        boys = current.get("boys", 0)

        if total == 0:
            return {"reply": "⚠️ No data available yet. Please try later."}

        if admin_state["mess_closed"]:
            return {"reply": "🚫 Mess is closed today"}

        # COMMANDS
        if message == "status":
            if total == 0:
                reply = "✅ No queue right now\nWalk in directly!"
            else:
                reply = f"""🍽️ Mess Status

👥 Line size: {total} people
👩 Girls line: {girls} | 👦 Boys line: {boys}
⏱️ Estimated wait: {wait_time} mins
📊 Crowd level: {get_crowd_level(total)}

{get_recommended_time(wait_time)}
🔢 Counters open: {admin_state["extra_counters"]}
"""
            return {"reply": reply}

        elif message == "help":
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