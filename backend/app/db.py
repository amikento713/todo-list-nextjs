import logging
import os

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger(__name__)

POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "todo_db")

SQLALCHEMY_DATABASE_URL = (
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
    f"@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def migrate_db() -> None:
    """Apply lightweight PostgreSQL migrations for databases created before schema changes."""
    inspector = inspect(engine)
    if "tasks" not in inspector.get_table_names():
        return

    existing = {column["name"] for column in inspector.get_columns("tasks")}
    migrations: list[tuple[str, str]] = []

    if "owner_id" not in existing:
        migrations.append(
            ("owner_id", "ALTER TABLE tasks ADD COLUMN owner_id INTEGER")
        )
    if "book_name" not in existing:
        migrations.append(
            ("book_name", "ALTER TABLE tasks ADD COLUMN book_name VARCHAR")
        )
    if "book_url" not in existing:
        migrations.append(
            ("book_url", "ALTER TABLE tasks ADD COLUMN book_url VARCHAR")
        )

    if not migrations:
        return

    with engine.begin() as conn:
        for column_name, statement in migrations:
            logger.info("Applying migration: add tasks.%s", column_name)
            conn.execute(text(statement))

        orphan_count = conn.execute(
            text("SELECT COUNT(*) FROM tasks WHERE owner_id IS NULL")
        ).scalar_one()
        if orphan_count:
            logger.warning(
                "Removing %s legacy task(s) without an owner after migration",
                orphan_count,
            )
            conn.execute(text("DELETE FROM tasks WHERE owner_id IS NULL"))
