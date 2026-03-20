import cv2

cap = cv2.VideoCapture(0)  # 0 = default webcam/laptop camera

if not cap.isOpened():
    print("Error: Cannot open camera")
else:
    print("Camera opened successfully!")

while True:
    ret, frame = cap.read()

    if not ret:
        print("Error: Cannot read frame")
        break

    cv2.imshow("Webcam Test", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):  # press Q to quit
        break

cap.release()
cv2.destroyAllWindows()