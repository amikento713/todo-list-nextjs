# Todo List Backend (FastAPI)

Minimal FastAPI backend for the Next.js Todo application.

Run (from backend/):

```bash
python -m venv .venv
source .venv/bin/activate   # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Endpoints:

- `GET /tasks` - list tasks
- `POST /tasks` - create task
- `PUT /tasks/{id}` - update task
- `DELETE /tasks/{id}` - delete task

Storage: SQLite database `todo.db` (created automatically). CORS configured for localhost:3000.

Notes on migrations:
- This scaffold creates tables automatically via SQLAlchemy's `Base.metadata.create_all()` which is convenient for development.
- For schema migrations in production, use Alembic or a similar tool to generate and apply migration scripts rather than `create_all`.
