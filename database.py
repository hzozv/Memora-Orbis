import sqlite3
from scheduler import process_review, create_task

# Connect to database
conn = sqlite3.connect("app_database.db")
cursor = conn.cursor()
conn.row_factory = sqlite3.Row # Dictionary

# Create flashcard table
cursor.execute(
    '''
    CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL, 
    answer TEXT NOT NULL, 
    difficulty REAL DEFAULT 2.5,
    stability REAL DEFAULT 1.0,
    last_reviewed TEXT,
    next_review TEXT,
    );
    '''
)




def save_database():
    conn.commit()