import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_plan(client: AsyncClient):
    # Симулируем запрос от фронтенда на добавление нового плана
    payload = {
        "title": "Семейный ужин",
        "description": "Принести пирог и хорошее настроение",
        "event_date": "2026-06-30T19:00:00",
        "color_tag": "#3b82f6",
        "creator_name": "Мама"
    }
    # тестируем чистый эндпоинт FastAPI
    response = await client.post("/api/events", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Семейный ужин"
    assert data["creator_name"] == "Мама"
    assert "id" in data

@pytest.mark.asyncio
async def test_get_plans_empty(client: AsyncClient):
    # Проверяем, что изначально планов нет
    response = await client.get("/api/events")
    assert response.status_code == 200
    assert response.json() == []
