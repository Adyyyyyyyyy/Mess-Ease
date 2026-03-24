from ultralytics import YOLO
import cv2
import requests

# Load model
model = YOLO("yolov8n.pt")

# Open camera (0 = laptop webcam)
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    
    if not ret:
        break

    results = model(frame)

    people_count = 0

    for box in results[0].boxes:
        if int(box.cls) == 0:   # class 0 = person
            people_count += 1

    print("People:", people_count)

    # Send to backend
    try:
        url = f"http://127.0.0.1:8000/update-count?people={people_count}"
        requests.get(url)
    except:
        print("Backend not reachable")

    # Show camera
    cv2.imshow("Mess Monitor", frame)

    # Press 'q' to exit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
