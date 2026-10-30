from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health():
    assert client.get("/api/health").json() == {"status": "ok"}


def test_rejects_dates_outside_assignment_period():
    response = client.get("/api/wind-data", params={"date": "2026-02-01"})
    assert response.status_code == 422
