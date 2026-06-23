import io

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth import get_db
from app.db import Base
from app.main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def auth_headers(username: str = "testuser", password: str = "shortpass"):
    client.post("/auth/register", json={"username": username, "password": password})
    login = client.post(
        "/auth/login", data={"username": username, "password": password}
    )
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_register_login_and_task_crud():
    headers = auth_headers("crud-user")

    response = client.get("/tasks/", headers=headers)
    assert response.status_code == 200
    assert response.json() == []

    payload = {
        "title": "Task1",
        "text": "Task1",
        "completed": False,
        "deadline": "2026-06-24",
    }
    response = client.post("/tasks/", json=payload, headers=headers)
    assert response.status_code == 201
    created = response.json()
    assert created["title"] == "Task1"
    assert created["text"] == "Task1"
    task_id = created["id"]

    response = client.get("/tasks/", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1

    response = client.put(
        f"/tasks/{task_id}", json={"completed": True}, headers=headers
    )
    assert response.status_code == 200
    assert response.json()["completed"] is True

    response = client.delete(f"/tasks/{task_id}", headers=headers)
    assert response.status_code == 204

    response = client.get("/tasks/", headers=headers)
    assert response.status_code == 200
    assert response.json() == []


def test_create_task_requires_title_and_valid_deadline():
    headers = auth_headers("validation-user")

    response = client.post(
        "/tasks/",
        json={"text": "   ", "completed": False, "deadline": "2026-06-24"},
        headers=headers,
    )
    assert response.status_code == 422

    response = client.post(
        "/tasks/",
        json={"text": "Valid task", "completed": False, "deadline": "not-a-date"},
        headers=headers,
    )
    assert response.status_code == 422


def test_duplicate_username_rejected():
    client.post("/auth/register", json={"username": "dup-user", "password": "pass123"})
    response = client.post(
        "/auth/register", json={"username": "dup-user", "password": "pass123"}
    )
    assert response.status_code == 400


def test_upload_requires_auth_and_pdf():
    response = client.post(
        "/upload-book",
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )
    assert response.status_code == 401

    headers = auth_headers("upload-user")
    response = client.post(
        "/upload-book",
        files={"file": ("notes.txt", b"hello", "text/plain")},
        headers=headers,
    )
    assert response.status_code == 400

    pdf_bytes = b"%PDF-1.4 test content"
    response = client.post(
        "/upload-book",
        files={"file": ("notes.pdf", pdf_bytes, "application/pdf")},
        headers=headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["url"].endswith(".pdf")


def test_clear_book_on_update():
    headers = auth_headers("book-user")

    upload = client.post(
        "/upload-book",
        files={"file": ("book.pdf", b"%PDF-1.4 sample", "application/pdf")},
        headers=headers,
    )
    book_url = upload.json()["url"]

    create = client.post(
        "/tasks/",
        json={
            "text": "Read book",
            "completed": False,
            "deadline": "2026-06-24",
            "book": {"name": "book.pdf", "url": book_url},
        },
        headers=headers,
    )
    task_id = create.json()["id"]

    update = client.put(
        f"/tasks/{task_id}",
        json={"book": None},
        headers=headers,
    )
    assert update.status_code == 200
    assert update.json()["book"] is None


def test_upload_rejects_large_file():
    headers = auth_headers("large-upload-user")
    large_pdf = io.BytesIO(b"%PDF-1.4" + (b"a" * (21 * 1024 * 1024)))

    response = client.post(
        "/upload-book",
        files={"file": ("large.pdf", large_pdf, "application/pdf")},
        headers=headers,
    )
    assert response.status_code == 413
