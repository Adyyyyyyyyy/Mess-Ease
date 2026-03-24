import sqlite3

conn = sqlite3.connect("mess.db")
cursor = conn.cursor()

# Create table if not exists
cursor.execute('''
CREATE TABLE IF NOT EXISTS people_count (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camera_id INTEGER,
    people_count INTEGER,
    queue_length INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')
conn.commit()