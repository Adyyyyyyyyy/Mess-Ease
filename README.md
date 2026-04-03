# Walk In. Not Wait In.
Mess-Ease is a smart mess management system that helps students avoid long queues by providing real-time crowd insights using computer vision and a WhatsApp-based assistant.

Problem
Students often have no visibility into mess crowd levels before arriving, leading to long wait times, wasted time, and missed meals.

Solution
Mess-Ease estimates crowd size in real time and delivers this information through a web dashboard and WhatsApp bot, allowing students to plan their visit efficiently.

Key Highlights
Real-time crowd monitoring
WhatsApp-based access (no app required)
Role-based system (User / Admin)
Simple and fast user experience

Features

User Side
Live crowd status
Estimated waiting time
Crowd level indication (Low, Medium, High)
Recommended time to visit
WhatsApp bot (Mess-Mate) for instant updates

Admin Side
Update crowd data
Control number of active counters
Mark mess as open/closed
Manual override for accuracy

How It Works
Crowd data is collected (via computer vision or manual update)
Backend calculates wait time and crowd level
Data is stored and served through APIs
Frontend dashboard and WhatsApp bot display real-time updates

Tech Stack
Frontend: React, Tailwind CSS
Backend: FastAPI
Computer Vision: OpenCV
Data Storage: JSON

Current Status
Frontend and backend successfully integrated
Real-time data flow working
WhatsApp bot functional
Admin controls implemented
UI improvements in progress

Future Scope
Deployment for campus-wide usage
Database upgrade (MongoDB/PostgreSQL)
Deployment for campus-wide usage
