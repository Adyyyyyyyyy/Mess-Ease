from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
import json
from utils import calculate_wait_time, get_user

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
        return {
            "current": {
                "people": 0,
                "wait_time": 0
            }
        }

def write_data(data):
    with open("data.json", "w") as file:
        json.dump(data, file)

# ---------- ROUTES ----------
@app.get("/")
def home():
    return {"message": "Mess Backend Running"}

@app.get("/mess-status")
def get_status():
    data = read_data()

    people = data["current"]["people"]
    wait_time = data["current"]["wait_time"]

    # simple logic for extra fields
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

@app.get("/update-count")
def update_count(people: int):
    wait_time = calculate_wait_time(people)

    data = {
        "current": {
            "people": people,
            "wait_time": wait_time
        }
    }

    write_data(data)
    return {"message": "Updated", "data": data}

# ---------- BOT ----------
@app.post("/bot")
async def bot(request: Request):
    try:
        form = await request.form()

        message = form.get("Body", "")
        phone = form.get("From", "unknown")

        message = message.lower()

        print("MESSAGE:", message)
        print("PHONE:", phone)

        user = get_user(phone)

        if not user:
            return {"reply": "Welcome! Please register first.\nSend: Name,College,Mess"}

        data = read_data()

        # SAFE access
        current = data.get("current", {})
        people = current.get("people", 0)
        wait_time = current.get("wait_time", 0)

        if "status" in message:
            return {"reply": f"👥 People: {people}\n⏳ Wait: {wait_time} min"}

        elif "help" in message:
            return {"reply": "Commands:\n1. status\n2. help"}

        else:
            return {"reply": "Type 'help'"}

    except Exception as e:
        print("🔥 ERROR:", str(e))
        return {"reply": "Server error"}

