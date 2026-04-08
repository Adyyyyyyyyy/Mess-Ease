from flask import Flask, request, jsonify
from twilio.twiml.messaging_response import MessagingResponse
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests

load_dotenv()

app = Flask(__name__)
CORS(app)  # allows dashboard (different port) to call /register

# ─── Config ───────────────────────────────────────────────────────────────────
DASHBOARD_LINK = os.getenv("DASHBOARD_LINK", "https://your-dashboard-link.com")
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://127.0.0.1:8000")
USE_MOCK_BACKEND = os.getenv("USE_MOCK_BACKEND", "false").lower() == "true"

# ─── In-memory session store ──────────────────────────────────────────────────
sessions = {}
# Tracks users waiting for gender input
awaiting_gender = {}

# ─── Intent detection (keyword based) ────────────────────────────────────────
def detect_intent(message):
    msg = message.lower().strip()

    greeting_words = [
        "hi", "hii", "hiii", "hello", "hey", "helo", "hy",
        "yo", "sup", "good morning", "good evening", "good afternoon"
    ]
    mess_words = [
        "mess", "crowd", "wait", "busy", "line", "queue",
        "bheed", "kitni", "kitne", "status", "estimate",
        "how many", "how busy", "kitna wait", "whats up in mess",
        "what's up in mess", "mess ka estimate", "mess status",
        "line kitni hai", "mess me bheed", "current status"
    ]
    help_words = [
        "help", "commands", "menu", "options", "kya kar sakte ho",
        "kya karte ho", "kya kya bata sakte ho"
    ]
    change_words = [
        "change", "update", "switch", "reset", "badlo",
        "change mess", "change college", "update mess", "update college"
    ]

    if any(word in msg for word in greeting_words):
        return "greeting"
    if any(word in msg for word in help_words):
        return "help"
    if any(word in msg for word in change_words):
        return "change_setup"
    if any(word in msg for word in mess_words):
        return "mess_status"
    return "unknown"


def get_mess_status(college, mess):
    print(f"🔍 USE_MOCK_BACKEND: {USE_MOCK_BACKEND}")
    print(f"🔍 BACKEND_BASE_URL: {BACKEND_BASE_URL}")
    if USE_MOCK_BACKEND:
        return {
            "success": True,
            "data": {
                "people": 9,
                "girls": 5,
                "boys": 4,
                "girls_wait": 0,
                "boys_wait": 0,
                "estimated_wait": "0 minutes",
                "crowd_level": "Low",
                "recommended_time": "🟢 Walk in directly, no wait!",
                "next_fresh_item": "Not available",
                "closing_in": "Not available"
            }
        }

    try:
        response = requests.get(
            f"{BACKEND_BASE_URL}/mess-status",
            params={"college": college, "mess": mess},
            timeout=5
        )
        response.raise_for_status()
        data = response.json()
        print(f"🔥 Backend data: {data}")

        return {
            "success": True,
            "data": {
                "people": data.get("people", 0),
                "girls": data.get("girls", 0),
                "boys": data.get("boys", 0),
                "girls_wait": data.get("girls_wait", 0),
                "boys_wait": data.get("boys_wait", 0),
                "estimated_wait": data.get("estimated_wait", "N/A"),
                "crowd_level": data.get("crowd_level", "N/A"),
                "recommended_time": data.get("recommended_time", "Go now!"),
                "next_fresh_item": data.get("next_fresh_item", "Not available"),
                "closing_in": data.get("closing_in", "Not available")
            }
        }

    except Exception as e:
        print(f"Backend error: {e}")
        return {"success": False}


# ─── /register — called by teammate's web form ────────────────────────────────
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data received"}), 400

    phone = data.get("phone", "").strip().replace(" ", "")  # remove spaces
    name = data.get("name", "").strip()
    college = data.get("college", "").strip()
    mess = data.get("mess", "").strip()

    if not all([phone, name, college, mess]):
        return jsonify({
            "error": "Missing required fields: phone, name, college, mess"
        }), 400

    sender_key = f"whatsapp:{phone}"

    sessions[sender_key] = {
        "state": "registered",
        "phone": phone,
        "name": name,
        "college": college,
        "mess": mess
    }

    print(f"Registered: {sender_key} → {college} - {mess}")
    print(f"Sessions: {sessions}")

    return jsonify({
        "success": True,
        "message": f"{name} registered successfully for {college} - {mess}",
        "data": sessions[sender_key]
    }), 200


# ─── /check — lets teammate verify registration worked ────────────────────────
@app.route("/check/<phone>", methods=["GET"])
def check_registration(phone):
    # phone comes in without +, so we add it
    sender_key = f"whatsapp:+{phone}"
    session = sessions.get(sender_key)

    if session:
        return jsonify({"registered": True, "details": session}), 200
    return jsonify({"registered": False}), 404


# ─── /whatsapp — Twilio calls this on every student message ──────────────────
@app.route("/whatsapp", methods=["POST"])
def whatsapp_reply():
    incoming_msg = request.form.get("Body", "").strip()
    sender = request.form.get("From", "").strip()

    print(f"Sender: {sender}")
    print(f"Message: {incoming_msg}")
    print(f"Sessions: {sessions}")

    resp = MessagingResponse()
    msg = resp.message()

    session = sessions.get(sender)

    # If not in memory, check backend database
    if not session or session.get("state") != "registered":
      try:
            mobile = sender.replace("whatsapp:", "").replace("+", "")
# Remove country code 91 if present
            if mobile.startswith("91") and len(mobile) == 12:
             mobile = mobile[2:]
            print(f"🔍 Checking mobile: {mobile}")
            verify = requests.post(
                f"{BACKEND_BASE_URL}/login",
                params={"mobile": mobile},
                timeout=5
            )
            verify_data = verify.json()
            print(f"📦 Backend response: {verify_data}")

            if verify_data.get("verified"):
                # Store in session for future messages
                sessions[sender] = {
                    "state": "registered",
                    "phone": mobile,
                    "name": verify_data["name"],
                    "college": verify_data["college"],
                    "mess": verify_data["mess"]
                }
                session = sessions[sender]
            else:
                msg.body(
                    "👋 Welcome to *Mess Monitor!*\n\n"
                    "Please register first from the dashboard "
                    "so I know your college and mess.\n\n"
                    f"Register here: {DASHBOARD_LINK}"
                )
                return str(resp)
      except Exception as e:
          
            print(f"❌ Backend call failed: {e}")
            msg.body("⚠️ Server error. Please try again.")
            return str(resp)

    name = session.get("name", "")
    college = session.get("college", "")
    mess = session.get("mess", "")

  # Check if waiting for gender response
    if sender in awaiting_gender:
        gender_input = incoming_msg.lower().strip()

        if any(w in gender_input for w in ["boy", "boys", "male", "gents", "lad", "bhai", "bro"]):
            gender = "boys"
        elif any(w in gender_input for w in ["girl", "girls", "female", "ladies", "di", "behen"]):
            gender = "girls"
        else:
            msg.body("❓ Please reply with *boys* or *girls* to get your slot.")
            return str(resp)

        # Remove from awaiting
        del awaiting_gender[sender]

        # Get slot from backend
        try:
            slot_res = requests.get(
                f"{BACKEND_BASE_URL}/get-slot",
                params={"gender": gender},
                timeout=5
            )
            slot_data = slot_res.json()

            if slot_data.get("success"):
                slot_time = slot_data["slot"]
                msg.body(
                    f"🎟️ Your Slot Confirmed!\n\n"
                    f"{'👦 Boys' if gender == 'boys' else '👩 Girls'} Counter\n"
                    f"⏰ Come at: *{slot_time} PM*\n\n"
                    f"You'll find max 5-6 people ahead of you.\n"
                    f"Walk in smart! 🍽️"
                )
            else:
                msg.body("⚠️ No slots available in current lunch window.")
        except Exception as e:
            print(f"Slot error: {e}")
            msg.body("⚠️ Could not get slot. Try again.")

        return str(resp)

    intent = detect_intent(incoming_msg)

    # ── Greeting ────────────────────────────────────────────────────────
    if intent == "greeting":
        msg.body(
            f"Hey {name}! 👋\n\n"
            f"Your mess: *{college} → {mess}*\n\n"
            f"Ask me anything:\n"
            f"• mess status\n"
            f"• how busy is mess\n"
            f"• kitni line hai\n"
            f"• help"
        )

    # ── Mess status ──────────────────────────────────────────────────────
    elif intent == "mess_status":
        result = get_mess_status(college, mess)
        print(f"🎯 Result: {result}")

        if result["success"]:
            data = result["data"]
            print(f"🎯 Data: {data}")

            girls = data.get("girls", 0)
            boys = data.get("boys", 0)
            girls_wait = data.get("girls_wait", 0)
            boys_wait = data.get("boys_wait", 0)

            # Ask for gender to assign slot
            awaiting_gender[sender] = True

            msg.body(
                f"🍽️ Mess Status — {mess}\n"
                f"🏫 {college}\n\n"
                f"👩 Girls Queue: {girls} people | ⏱️ Wait: {girls_wait} mins\n"
                f"👦 Boys Queue: {boys} people | ⏱️ Wait: {boys_wait} mins\n\n"
                f"📊 Crowd level: {data['crowd_level']}\n\n"
                f"🎟️ Want your personal slot?\n"
                f"Reply with *boys* or *girls*"
            )
        else:
            msg.body("⚠️ Could not fetch mess data. Try again.")

    # ── Change setup ─────────────────────────────────────────────────────
    elif intent == "change_setup":
        msg.body(
            f"🔄 To change your college or mess, "
            f"update from the dashboard.\n\n"
            f"Dashboard: {DASHBOARD_LINK}"
        )

    # ── Help ─────────────────────────────────────────────────────────────
    elif intent == "help":
        msg.body(
            f"📋 What can I do?\n\n"
            f"• hi — greeting\n"
            f"• mess status — crowd + slot booking\n"
            f"• kitni line hai — Hinglish works\n"
            f"• change my mess — update setup\n"
            f"• help — show this menu\n\n"
            f"📍 Current: {college} → {mess}"
        )

    # ── Unknown ──────────────────────────────────────────────────────────
    else:
        result = get_mess_status(college, mess)
        if result["success"]:
            data = result["data"]
            awaiting_gender[sender] = True
            msg.body(
                f"🍽️ {mess} — {college}\n\n"
                f"👩 Girls: {data.get('girls', 0)} people\n"
                f"👦 Boys: {data.get('boys', 0)} people\n\n"
                f"Reply *boys* or *girls* for your slot!"
            )
        else:
            msg.body("❓ Type *help* to see commands.")

    return str(resp)


# ─── Run ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)