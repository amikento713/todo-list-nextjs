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

Storage: in-memory list (reset on restart). CORS configured for localhost:3000.
