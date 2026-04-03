import sqlite3

conn = sqlite3.connect("mess.db", check_same_thread=False)
cursor = conn.cursor()

# Users table — stores registration data
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    college TEXT NOT NULL,
    mess TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT "student",
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')

# Analytics table — stores crowd data over time
cursor.execute('''
CREATE TABLE IF NOT EXISTS crowd_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    girls INTEGER DEFAULT 0,
    boys INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    wait_time INTEGER DEFAULT 0,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')

conn.commit()