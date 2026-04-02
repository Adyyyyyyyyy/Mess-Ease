import sqlite3

conn = sqlite3.connect("mess.db", check_same_thread=False)
cursor = conn.cursor()

# Existing table
cursor.execute('''
CREATE TABLE IF NOT EXISTS people_count (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camera_id INTEGER,
    people_count INTEGER,
    queue_length INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')

# New users table
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    college TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT "student",
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')

conn.commit()