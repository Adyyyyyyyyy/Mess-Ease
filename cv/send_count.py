import cv2
from ultralytics import YOLO
import requests
import time
import threading

model = YOLO("yolov8n.pt")

cap = cv2.VideoCapture("http://10.60.81.72:4747/video")

if not cap.isOpened():
    print("Error: Cannot open camera")
    exit()

# Member 2's API
API_URL = "http://10.60.81.226:8000/update-count"

# Frame dimensions
ret, sample_frame = cap.read()
frame_height, frame_width = sample_frame.shape[:2]
mid_x = frame_width // 2

def get_zone(box):
    x1, y1, x2, y2 = box
    cx = (x1 + x2) // 2
    return "girls" if cx < mid_x else "boys"

def send_count(girls, boys, total):
    try:
        response = requests.get(
            API_URL,
            params={"girls": girls, "boys": boys, "total": total},
            timeout=3
        )
        if response.status_code == 200:
            print(f"✅ Sent → Girls: {girls} | Boys: {boys} | Total: {total} | Response: {response.json()}")
        else:
            print(f"⚠️ API error: {response.status_code}")
    except Exception as e:
        print(f"❌ Could not reach API: {e}")

def send_in_background(girls, boys, total):
    thread = threading.Thread(target=send_count, args=(girls, boys, total))
    thread.daemon = True
    thread.start()

last_sent_time = time.time()
SEND_INTERVAL = 5

while True:
    ret, frame = cap.read()

    if not ret:
        print("Error: Cannot read frame")
        break

    # Draw zones
    cv2.rectangle(frame, (0, 0), (mid_x, frame_height), (255, 105, 180), 2)
    cv2.putText(frame, "GIRLS ZONE", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 105, 180), 2)

    cv2.rectangle(frame, (mid_x, 0), (frame_width, frame_height), (255, 0, 0), 2)
    cv2.putText(frame, "BOYS ZONE", (mid_x + 10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)

    # Run YOLO
    results = model(frame, verbose=False)

    girls_count = 0
    boys_count  = 0

    for box in results[0].boxes:
        if int(box.cls) == 0:
            coords = list(map(int, box.xyxy[0]))
            x1, y1, x2, y2 = coords
            zone = get_zone(coords)

            if zone == "girls":
                girls_count += 1
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 105, 180), 2)
                cv2.putText(frame, "Girl", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 105, 180), 2)
            else:
                boys_count += 1
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
                cv2.putText(frame, "Boy", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

    total = girls_count + boys_count

    # Show counts
    cv2.putText(frame, f"Girls: {girls_count}", (10, frame_height - 60),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 105, 180), 2)
    cv2.putText(frame, f"Boys: {boys_count}", (mid_x + 10, frame_height - 60),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
    cv2.putText(frame, f"Total: {total}", (frame_width // 2 - 60, frame_height - 20),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)

    # Send every 5 seconds
    current_time = time.time()
    if current_time - last_sent_time >= SEND_INTERVAL:
        send_in_background(girls_count, boys_count, total)
        last_sent_time = current_time

    cv2.imshow("Mess Monitor - Live Phase 2", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()