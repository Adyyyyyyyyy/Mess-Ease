from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from utils import calculate_wait_time, get_user, register_user, get_crowd_level, get_recommended_time

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- ADMIN STATE ----------
admin_state = {
    "mess_closed": False,
    "extra_counters": 1
}

# ---------- MOCK DATA ----------
MOCK_DATA = {
    "girls": 5,
    "boys": 4,
    "total": 9
}

# ---------- SLOT SYSTEM ----------
from datetime import datetime, timedelta

LUNCH_START = "12:50"
LUNCH_END = "14:00"
SLOT_INTERVAL = 5       # minutes
MAX_PER_SLOT = 6        # max students per slot per counter

# Tracks assigned slots {slot_time: {girls: count, boys: count}}
slot_bookings = {
    "12:50": {"girls": MOCK_DATA["girls"], "boys": MOCK_DATA["boys"]}
}

def get_next_slot(gender):
    now = datetime.now()
    today = now.strftime("%Y-%m-%d")

    # Parse lunch window
    start = datetime.strptime(f"{today} {LUNCH_START}", "%Y-%m-%d %H:%M")
    end = datetime.strptime(f"{today} {LUNCH_END}", "%Y-%m-%d %H:%M")

    # If before lunch, start from lunch start
    # If during lunch, start from next slot
    if now < start:
        current_slot = start
    else:
        # Round up to next slot
        mins_since_start = (now - start).seconds // 60
        slots_passed = (mins_since_start // SLOT_INTERVAL) + 1
        current_slot = start + timedelta(minutes=slots_passed * SLOT_INTERVAL)

    # Find next available slot for this gender
    while current_slot < end:
        slot_key = current_slot.strftime("%H:%M")
        if slot_key not in slot_bookings:
            slot_bookings[slot_key] = {"girls": 0, "boys": 0}

        if slot_bookings[slot_key][gender] < MAX_PER_SLOT:
            slot_bookings[slot_key][gender] += 1
            return slot_key

        current_slot += timedelta(minutes=SLOT_INTERVAL)

    return None  # No slots available

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


class RegisterRequest(BaseModel):
    name: str
    mobile: str
    college: str
    mess: str = "mess1"
    role: str = "student"

@app.post("/register")
def register(data: RegisterRequest):
    existing = get_user(data.mobile)
    if existing:
        return {"success": False, "message": "Mobile already registered"}
    success = register_user(data.name, data.mobile, data.college, data.mess, data.role)
    if success:
        return {
            "success": True,
            "message": "Registered successfully",
            "user": {
                "name": data.name,
                "mobile": data.mobile,
                "college": data.college,
                "mess": data.mess,
                "role": data.role
            }
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
        "mess": user["mess"],
        "role": user["role"]
    }

# 🔥 STATUS API
@app.get("/mess-status")
def get_status(college: str = None, mess: str = None):
    if admin_state["mess_closed"]:
        return {"message": f"🚫 Mess is closed today"}

    girls = MOCK_DATA["girls"]
    boys = MOCK_DATA["boys"]
    total = girls + boys

    girls_wait = calculate_wait_time(girls, admin_state["extra_counters"])
    boys_wait = calculate_wait_time(boys, admin_state["extra_counters"])

    return {
        "girls": girls,
        "boys": boys,
        "people": total,
        "girls_wait": girls_wait,
        "boys_wait": boys_wait,
        "estimated_wait": f"{max(girls_wait, boys_wait)} minutes",
        "crowd_level": get_crowd_level(total),
        "recommended_time": get_recommended_time(max(girls_wait, boys_wait)),
        "counters": admin_state["extra_counters"]
    }
    
@app.get("/get-slot")
def get_slot(gender: str):
    slot = get_next_slot(gender)
    if slot:
        return {"success": True, "slot": slot}
    return {"success": False, "message": "No slots available"}

# 🔥 UPDATE COUNT (YOLO)
@app.get("/update-count")
def update_count(total: int, girls: int = 0, boys: int = 0, mess: str = "mess1"):
    wait_time = calculate_wait_time(total, admin_state["extra_counters"])

    data = read_data()
    data[mess] = {
        "girls": girls,
        "boys": boys,
        "total": total,
        "wait_time": wait_time
    }

    write_data(data)
    log_crowd(girls, boys, total, wait_time)

    return {"message": "Updated", "data": data}

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

        mobile = phone.replace("whatsapp:", "")
        user = get_user(mobile)

        if not user:
            return {"reply": "👋 You are not registered!\nPlease register at: [your website link]\n\nOnly registered students can use this bot."}

        # Get mess specific to this user
        user_mess = user["mess"]
        user_college = user["college"]

        data = read_data()

        # Fetch data for user's specific mess
        mess_data = data.get(user_mess, {})
        total = mess_data.get("total", 0)
        wait_time = mess_data.get("wait_time", 0)
        girls = mess_data.get("girls", 0)
        boys = mess_data.get("boys", 0)

        if admin_state["mess_closed"]:
            return {"reply": f"🚫 {user_mess} is closed today"}

        if message == "status":
            if total == 0:
                reply = f"✅ No queue right now at {user_mess}\nWalk in directly!"
            else:
                reply = f"""🍽️ Mess Status — {user_mess}
👤 {user["name"]} | {user_college}

👥 Line size: {total} people
👩 Girls line: {girls} | 👦 Boys line: {boys}
⏱️ Estimated wait: {wait_time} mins
📊 Crowd level: {get_crowd_level(total)}

{get_recommended_time(wait_time)}
🔢 Counters open: {admin_state["extra_counters"]}"""

            return {"reply": reply}

        elif message == "help":
            return {
                "reply": """📌 Commands:
1. status → Check your mess crowd
2. help → Show commands"""
            }

        else:
            return {"reply": "❓ Type 'status' to check mess crowd"}

    except Exception as e:
        print("🔥 ERROR:", str(e))
        return {"reply": "Server error"}