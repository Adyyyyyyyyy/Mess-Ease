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


# ─── Fetch mess status from Member 2's backend ────────────────────────────────
def get_mess_status(college, mess):
    if USE_MOCK_BACKEND:
        return {
            "success": True,
            "data": {
                "people": 52,
                "estimated_wait": "7 minutes",
                "crowd_level": "Moderate",
                "next_fresh_item": "4 minutes",
                "closing_in": "25 minutes"
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

        return {
            "success": True,
            "data": {
                "people": data.get("people", "N/A"),
                "estimated_wait": data.get("estimated_wait", "N/A"),
                "crowd_level": data.get("crowd_level", "N/A"),
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

    # ── Not registered → ask them to use dashboard ─────────────────────────
    if not session or session.get("state") != "registered":
        msg.body(
            "👋 Welcome to *Mess Monitor!*\n\n"
            "Please register first from the dashboard "
            "so I know your college and mess.\n\n"
            f"Register here: {DASHBOARD_LINK}"
        )
        return str(resp)

    name = session.get("name", "")
    college = session.get("college", "")
    mess = session.get("mess", "")

    intent = detect_intent(incoming_msg)

    # ── Greeting ───────────────────────────────────────────────────────────
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

    # ── Mess status ────────────────────────────────────────────────────────
    elif intent == "mess_status":
        result = get_mess_status(college, mess)

        if result["success"]:
            data = result["data"]
            msg.body(
                f"🍽️ Mess Status — {mess}\n"
                f"🏫 {college}\n\n"
                f"👥 People inside: {data['people']}\n"
                f"⏱️ Estimated wait: {data['estimated_wait']}\n"
                f"📊 Crowd level: {data['crowd_level']}\n"
                f"🍳 Next fresh item in: {data['next_fresh_item']}\n"
                f"🔒 Closing in: {data['closing_in']}"
            )
        else:
            msg.body(
                "⚠️ Could not fetch mess data right now.\n\n"
                "Please try again in a moment."
            )

    # ── Change setup ───────────────────────────────────────────────────────
    elif intent == "change_setup":
        msg.body(
            "🔄 To change your college or mess, "
            "update your details from the dashboard.\n\n"
            f"Dashboard: {DASHBOARD_LINK}"
        )

    # ── Help ───────────────────────────────────────────────────────────────
    elif intent == "help":
        msg.body(
            f"📋 What can I do?\n\n"
            f"Just type naturally:\n"
            f"• hi — greeting\n"
            f"• mess status — crowd + wait time\n"
            f"• how busy is mess — same\n"
            f"• kitni line hai — Hinglish works too\n"
            f"• change my mess — update setup\n"
            f"• help — show this menu\n\n"
            f"📍 Current: {college} → {mess}"
        )

    # ── Unknown → try showing mess status anyway ───────────────────────────
    else:
        result = get_mess_status(college, mess)

        if result["success"]:
            data = result["data"]
            msg.body(
                f"Not sure what you meant, but here's your mess update:\n\n"
                f"🍽️ {mess} — {college}\n"
                f"👥 People: {data['people']}\n"
                f"⏱️ Wait: {data['estimated_wait']}\n"
                f"📊 Crowd: {data['crowd_level']}\n\n"
                f"Type *help* to see all commands."
            )
        else:
            msg.body(
                "❓ Didn't catch that.\n\n"
                "Try:\n"
                "• mess status\n"
                "• kitni line hai\n"
                "• help"
            )

    return str(resp)


# ─── Run ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)