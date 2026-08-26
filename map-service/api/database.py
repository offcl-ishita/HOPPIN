import os
from contextlib import contextmanager

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


@contextmanager
def get_cursor(commit: bool = False):
    """Open a fresh connection for this request and yield a dict-row cursor.

    Deliberately not a persistent connection pool: on Vercel each serverless
    instance is ephemeral and there can be many of them running at once, so
    an in-process pool multiplies into far more Postgres connections than
    Supabase's direct connection limit allows, and pooled sockets can go
    stale across freeze/thaw cycles between invocations. Instead, point
    DATABASE_URL at Supabase's connection pooler (Supavisor, "Transaction"
    mode, port 6543) and let it absorb the fan-out — this function just
    opens and closes one lightweight connection per request.
    """
    if not DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL is not set. Locally, copy .env.example to .env. "
            "On Vercel, set it under Project Settings -> Environment Variables."
        )

    with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            yield cur
            if commit:
                conn.commit()
            else:
                conn.rollback()
