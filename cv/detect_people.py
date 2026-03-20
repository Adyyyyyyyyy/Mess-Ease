import cv2
from ultralytics import YOLO

# Load pretrained YOLOv8 nano model
# First run: auto downloads yolov8n.pt (~6MB)
model = YOLO("yolov8n.pt")

# Open webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Cannot open camera")
    exit()

while True:
    ret, frame = cap.read()

    if not ret:
        print("Error: Cannot read frame")
        break

    # Run YOLO detection on current frame
    results = model(frame, verbose=False)

    people_count = 0

    # Loop through all detected objects
    for box in results[0].boxes:
        if int(box.cls) == 0:  # class 0 = person
            people_count += 1

            # Draw green box around each person
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, "Person", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    # Show count on top left of screen
    cv2.putText(frame, f"People Count: {people_count}", (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)

    cv2.imshow("Mess Monitor - People Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()