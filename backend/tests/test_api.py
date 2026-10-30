from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health():
    assert client.get("/api/health").json() == {"status": "ok"}


def test_rejects_delivery_before_january_decision_window():
    response = client.get("/api/wind-data", params={"date": "2026-01-01"})
    assert response.status_code == 422


def test_rejects_delivery_after_january_decision_window():
    response = client.get("/api/wind-data", params={"date": "2026-02-02"})
    assert response.status_code == 422


def test_accepts_february_first_delivery_for_january_31_decision(monkeypatch):
    async def empty_day_data(*_args, **_kwargs):
        return [], []

    monkeypatch.setattr("app.main.fetch_day_data", empty_day_data)
    response = client.get("/api/wind-data", params={"date": "2026-02-01"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["delivery_date"] == "2026-02-01"
    assert payload["decision_cutoff"].startswith("2026-01-31T12:00:00")
