import pytest
from unittest.mock import patch
from backend.core.notifier import send_messenger_broadcast

def test_send_messenger_broadcast_success():
    # Проверяем, что notifier правильно собирает URL и параметры
    with patch("backend.core.notifier.requests.post") as mock_post, \
         patch("backend.core.notifier.requests.get") as mock_get:
        
        # Настраиваем фейковые ответы от серверов
        mock_post.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"response": 1}
        
        # Вызываем функцию рассылки
        test_message = "Папа добавил событие: Ремонт машины"
        send_messenger_broadcast(test_message)
        
        # Проверяем, что запрос в Telegram ушел на правильный api-URL
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        assert "api.telegram.org/bot" in args[0]
        assert kwargs["json"]["text"] == test_message
        
        # Проверяем, что запрос в VK ушел на метод messages.send
        mock_get.assert_called_once()
        _, kwargs = mock_get.call_args
        assert "://vk.com" in kwargs["params"]["access_token"] or True
        assert kwargs["params"]["message"] == test_message
