from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import json
import time

app = FastAPI()

# ---------- CORS ----------
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
            },
            "alerts": {
                "fresh_batch": False,
                "food_ending": False,
                "timestamp": 0
            }
        }

def write_data(data):
    with open("data.json", "w") as file:
        json.dump(data, file, indent=4)

# ---------- HOME ----------
@app.get("/")
def home():
    return {"message": "Backend running 🚀"}

# ---------- MAIN STATUS ----------
@app.get("/mess-status")
def get_status():
    data = read_data()

    people = data["current"].get("people", 0)
    wait_time = data["current"].get("wait_time", 0)

    # crowd logic
    if people < 30:
        crowd = "Low"
    elif people < 70:
        crowd = "Moderate"
    else:
        crowd = "High"

    alerts = data.get("alerts", {})

    return {
        "people": people,
        "wait": f"{wait_time} min",
        "crowd": crowd,
        "alerts": alerts,
        "history": [
            {"time": "9AM", "people": 20},
            {"time": "10AM", "people": 35},
            {"time": "11AM", "people": 50},
            {"time": "12PM", "people": 80},
            {"time": "1PM", "people": 65},
            {"time": "2PM", "people": 40}
        ]
    }

# ---------- UPDATE COUNT ----------
@app.get("/update-count")
def update_count(people: int):
    wait_time = int(people / 10)  # simple logic

    data = read_data()

    data["current"] = {
        "people": people,
        "wait_time": wait_time
    }

    write_data(data)

    return {"message": "Updated"}

# ---------- ALERTS ----------
@app.get("/fresh-batch")
def fresh_batch():
    data = read_data()

    data["alerts"] = {
        "fresh_batch": True,
        "food_ending": False,
        "timestamp": time.time()
    }

    write_data(data)
    return {"status": "Fresh batch triggered"}

@app.get("/food-ending")
def food_ending():
    data = read_data()

    data["alerts"] = {
        "fresh_batch": False,
        "food_ending": True,
        "timestamp": time.time()
    }

    write_data(data)
    return {"status": "Food ending triggered"}