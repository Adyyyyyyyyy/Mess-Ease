import cv2
from ultralytics import YOLO
import requests
import time
import threading

model = YOLO("yolov8n.pt")

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Cannot open camera")
    exit()

API_URL = "http://172.20.10.5:8000/update-count"

ROI_X1, ROI_Y1 = 150, 100
ROI_X2, ROI_Y2 = 500, 400

def is_inside_roi(box, roi):
    x1, y1, x2, y2 = box
    cx = (x1 + x2) // 2
    cy = (y1 + y2) // 2
    rx1, ry1, rx2, ry2 = roi
    return rx1 < cx < rx2 and ry1 < cy < ry2

def send_count(people_count):
    try:
        response = requests.get(API_URL, params={"people": people_count}, timeout=3)
        if response.status_code == 200:
            print(f"✅ Sent count: {people_count} → {response.json()}")
        else:
            print(f"⚠️ API error: {response.status_code}")
    except Exception as e:
        print(f"❌ Could not reach API: {e}")

def send_in_background(people_count):
    # Runs send_count in a separate thread so camera doesn't freeze
    thread = threading.Thread(target=send_count, args=(people_count,))
    thread.daemon = True
    thread.start()

last_sent_time = time.time()
SEND_INTERVAL = 5

while True:
    ret, frame = cap.read()

    if not ret:
        print("Error: Cannot read frame")
        break

    cv2.rectangle(frame, (ROI_X1, ROI_Y1), (ROI_X2, ROI_Y2), (255, 0, 0), 2)
    cv2.putText(frame, "MESS AREA", (ROI_X1, ROI_Y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

    results = model(frame, verbose=False)

    people_count = 0

    for box in results[0].boxes:
        if int(box.cls) == 0:
            coords = list(map(int, box.xyxy[0]))
            x1, y1, x2, y2 = coords

            inside = is_inside_roi(coords, (ROI_X1, ROI_Y1, ROI_X2, ROI_Y2))

            if inside:
                people_count += 1
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, "Counted", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            else:
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(frame, "Outside", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

    cv2.putText(frame, f"People in Mess: {people_count}", (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 255), 3)

    current_time = time.time()
    if current_time - last_sent_time >= SEND_INTERVAL:
        send_in_background(people_count)  # ← non-blocking now
        last_sent_time = current_time

    cv2.imshow("Mess Monitor - Live", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()


