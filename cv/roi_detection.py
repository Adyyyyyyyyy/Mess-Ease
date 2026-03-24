import cv2
from ultralytics import YOLO

model = YOLO("yolov8n.pt")

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Cannot open camera")
    exit()

# Get frame dimensions
ret, sample_frame = cap.read()
frame_height, frame_width = sample_frame.shape[:2]
mid_x = frame_width // 2  # middle of frame

# Zone coordinates
# Left half = Girls, Right half = Boys
GIRLS_ZONE = (0,       0, mid_x,        frame_height)
BOYS_ZONE  = (mid_x,   0, frame_width,  frame_height)

def get_zone(box):
    x1, y1, x2, y2 = box
    cx = (x1 + x2) // 2  # center x of person
    if cx < mid_x:
        return "girls"
    else:
        return "boys"

while True:
    ret, frame = cap.read()

    if not ret:
        print("Error: Cannot read frame")
        break

    # Draw Girls zone (left) in pink
    cv2.rectangle(frame, (GIRLS_ZONE[0], GIRLS_ZONE[1]),
                  (GIRLS_ZONE[2], GIRLS_ZONE[3]), (255, 105, 180), 2)
    cv2.putText(frame, "GIRLS ZONE", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 105, 180), 2)

    # Draw Boys zone (right) in blue
    cv2.rectangle(frame, (BOYS_ZONE[0], BOYS_ZONE[1]),
                  (BOYS_ZONE[2], BOYS_ZONE[3]), (255, 0, 0), 2)
    cv2.putText(frame, "BOYS ZONE", (mid_x + 10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)

    # Run YOLO
    results = model(frame, verbose=False)

    girls_count = 0
    boys_count  = 0

    for box in results[0].boxes:
        if int(box.cls) == 0:  # person
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

    # Show counts on screen
    cv2.putText(frame, f"Girls: {girls_count}", (10, frame_height - 60),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 105, 180), 2)
    cv2.putText(frame, f"Boys: {boys_count}", (mid_x + 10, frame_height - 60),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
    cv2.putText(frame, f"Total: {total}", (frame_width // 2 - 60, frame_height - 20),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)

    cv2.imshow("Mess Monitor - Phase 2", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()