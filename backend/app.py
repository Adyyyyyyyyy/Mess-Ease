from fastapi import FastAPI, Request
import json
from utils import calculate_wait_time, get_user, get_crowd_level, get_recommended_time

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- FILE HANDLING ----------
def read_data():
    try:
        with open("data.json", "r") as file:
            return json.load(file)
    except:
        # Initializing with both current status and alerts to avoid KeyErrors
        return {
            "current": {
                "girls": 0,
                "boys": 0,
                "total": 0,
                "wait_time": 0
            },
            "alerts": {
                "fresh_batch": False,
                "food_ending": False
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


    people = data.get("current", {}).get("people", 0)
    wait_time = data.get("current", {}).get("wait_time", 0)

    # Simple logic for crowd level
    if people < 30:
        crowd = "Low"
    elif people < 70:
        crowd = "Moderate"
    else:
        crowd = "High"

    return {
        "people": people,
        "estimated_wait": f"{wait_time} minutes",
        "crowd_level": crowd,
        "next_fresh_item": "10 minutes",
        "closing_in": "30 minutes",
        "history": [
            {"time": "9AM", "people": 20},
            {"time": "10AM", "people": 35},
            {"time": "11AM", "people": 50},
            {"time": "12PM", "people": 80},
            {"time": "1PM", "people": 65},
            {"time": "2PM", "people": 40}
        ]
    }

# 🔥 YOLO UPDATE API
@app.get("/update-count")


def update_count(people: int):
    wait_time = calculate_wait_time(people)
    data = read_data() # Read existing data first to preserve alerts

    data["current"] = {
        "people": people,
        "wait_time": wait_time

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


        # Correctly indented logic block
        if "status" in message:
            alerts = data.get("alerts", {})
            import time
            timestamp = alrets.get("timestamp", 0)
            if time.time() - timestamp > 600:
                alrets = {}
                
            response = f"👥 People: {people}\n⏱️ Wait: {wait_time} min"

            if alerts.get("fresh_batch"):
                response += "\n🍲 Fresh batch available!"

            if alerts.get("food_ending"):
                response += "\n⚠️ Food ending soon!"
            
            return {"reply": response}
        
        # Default reply if "status" is not in message
        return {"reply": "I only understand 'status' right now. Try sending 'status'!"}

    except Exception as e:
        print(f"Error: {e}")
        return {"reply": "Sorry, I encountered an error processing your request."}

# ---------- ALERT ENDPOINTS ----------
@app.post("/fresh-batch")
def fresh_batch():
    data = read_data()
    import time

    data["alerts"] = {
    "fresh_batch": True,
    "food_ending": False,
    "timestamp": time.time()
}

    write_data(data)
    print("🔥 Fresh batch triggered")
    return {"status": "fresh batch sent"}

@app.post("/food-ending")
def food_ending():
    data = read_data()
    import time

    data["alerts"] = {
        "fresh_batch": False,
        "food_ending": True,
        "timestamp": time.time()
    }

    write_data(data)
    print("⚠️ Food ending triggered")
    return {"status": "food ending alert"}

