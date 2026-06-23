import logging
import os

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger(__name__)

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "todo.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.abspath(DB_PATH)}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def migrate_db() -> None:
    """Apply lightweight SQLite migrations for dev databases created before schema changes."""
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
