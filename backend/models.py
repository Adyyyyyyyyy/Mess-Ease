from database import conn

def insert_data(camera_id, people_count, queue_length):
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO people_count (camera_id, people_count, queue_length)
    VALUES (?, ?, ?)
    ''', (camera_id, people_count, queue_length))
    conn.commit()