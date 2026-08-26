import os
from contextlib import contextmanager

from dotenv import load_dotenv
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Copy backend/.env.example to backend/.env "
        "and fill in your Supabase/Postgres connection string."
    )

_pool = ConnectionPool(conninfo=DATABASE_URL, min_size=1, max_size=10, open=True)


@contextmanager
def get_cursor(commit: bool = False):
    """Borrow a pooled connection and yield a dict-row cursor."""
    with _pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            yield cur
            if commit:
                conn.commit()
            else:
                conn.rollback()
