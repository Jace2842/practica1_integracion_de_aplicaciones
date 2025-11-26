import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

# Pool de conexiones
connection_pool = None

def init_pool():
    global connection_pool
    try:
        connection_pool = psycopg2.pool.SimpleConnectionPool(
            1, 20,
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME', 'freshgo'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD')
        )
        print("✅ Pool de conexiones PostgreSQL creado (IoT)")
    except Exception as e:
        print(f"❌ Error creando pool de conexiones: {e}")
        raise

def get_connection():
    if connection_pool:
        return connection_pool.getconn()
    raise Exception("Pool de conexiones no inicializado")

def return_connection(conn):
    if connection_pool:
        connection_pool.putconn(conn)

def query(sql, params=None):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(sql, params or ())
        
        if sql.strip().upper().startswith('SELECT'):
            result = cursor.fetchall()
            cursor.close()
            return result
        else:
            conn.commit()
            cursor.close()
            return None
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"[DB Error] {e}")
        raise
    finally:
        if conn:
            return_connection(conn)

def query_one(sql, params=None):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(sql, params or ())
        result = cursor.fetchone()
        cursor.close()
        return result
    except Exception as e:
        print(f"[DB Error] {e}")
        raise
    finally:
        if conn:
            return_connection(conn)

# Inicializar pool al importar
init_pool()