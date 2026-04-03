from database import conn

def log_crowd(girls, boys, total, wait_time):
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO crowd_log (girls, boys, total, wait_time)
        VALUES (?, ?, ?, ?)
    ''', (girls, boys, total, wait_time))
    conn.commit()

def get_analytics():
    cursor = conn.cursor()

    # Total visitors today
    cursor.execute('''
        SELECT 
            SUM(girls) as total_girls,
            SUM(boys) as total_boys,
            SUM(total) as total_people,
            MAX(total) as peak_crowd,
            COUNT(*) as total_logs
        FROM crowd_log
        WHERE DATE(logged_at) = DATE('now')
    ''')
    row = cursor.fetchone()

    # History for chart (last 20 entries)
    cursor.execute('''
        SELECT total, girls, boys, wait_time,
               strftime('%H:%M', logged_at) as time
        FROM crowd_log
        ORDER BY logged_at DESC
        LIMIT 20
    ''')
    history = [
        {"time": r[4], "total": r[0], "girls": r[1], "boys": r[2], "wait_time": r[3]}
        for r in cursor.fetchall()
    ]
    history.reverse()  # oldest first for chart

    return {
        "today": {
            "total_girls": row[0] or 0,
            "total_boys": row[1] or 0,
            "total_people": row[2] or 0,
            "peak_crowd": row[3] or 0
        },
        "history": history
    }