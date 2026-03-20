import cv2
from ultralytics import YOLO

model = YOLO("yolov8n.pt")

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Cannot open camera")
    exit()

# ROI coordinates (x1, y1) = top-left, (x2, y2) = bottom-right
# These values are for a typical webcam frame (640x480)
# We will adjust these based on your camera view
ROI_X1, ROI_Y1 = 150, 100
ROI_X2, ROI_Y2 = 500, 400

def is_inside_roi(box, roi):
    # Check if center of detected person is inside ROI
    x1, y1, x2, y2 = box
    cx = (x1 + x2) // 2  # center x of person box
    cy = (y1 + y2) // 2  # center y of person box

    rx1, ry1, rx2, ry2 = roi
    return rx1 < cx < rx2 and ry1 < cy < ry2

while True:
    ret, frame = cap.read()

    if not ret:
        print("Error: Cannot read frame")
        break

    # Draw the ROI box in blue
    cv2.rectangle(frame, (ROI_X1, ROI_Y1), (ROI_X2, ROI_Y2), (255, 0, 0), 2)
    cv2.putText(frame, "MESS AREA", (ROI_X1, ROI_Y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

    # Run YOLO detection
    results = model(frame, verbose=False)

    people_count = 0

    for box in results[0].boxes:
        if int(box.cls) == 0:  # person
            coords = list(map(int, box.xyxy[0]))
            x1, y1, x2, y2 = coords

            inside = is_inside_roi(coords, (ROI_X1, ROI_Y1, ROI_X2, ROI_Y2))

            if inside:
                people_count += 1
                # Green box = inside ROI (counted)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, "Counted", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            else:
                # Red box = outside ROI (not counted)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(frame, "Outside", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

    # Show count
    cv2.putText(frame, f"People in Mess: {people_count}", (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 255), 3)

    cv2.imshow("Mess Monitor - ROI Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()