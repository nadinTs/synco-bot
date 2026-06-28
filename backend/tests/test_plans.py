import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_plan(client: AsyncClient):
    # Симулируем запрос от фронтенда на добавление нового плана
    payload = {
        "title": "Семейный ужин",
        "description": "Принести пирог и хорошее настроение",
        "date": "2026-06-30T19:00:00",
        "color": "#3b82f6",
        "creator_role": "Мама"
    }
    # тестируем чистый эндпоинт FastAPI
    response = await client.post("/api/plans", json=payload)
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Семейный ужин"
    assert data["creator_role"] == "Мама"
    assert "id" in data

@pytest.mark.asyncio
async def test_get_plans_empty(client: AsyncClient):
    # Проверяем, что изначально планов нет
    response = await client.get("/api/plans")
    assert response.status_code == 200
    assert response.json() == []
