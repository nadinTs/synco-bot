import os

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://synco_user:secret_password@localhost:5432/synco_db"
)

TG_TOKEN = "" # TODO: Настоящий токен добавить
VK_TOKEN = "" # TODO: Настоящий токен добавить

SMTP_HOST = "smtp.yandex.ru"
SMTP_PORT = 465
SMTP_USER = "family-bot@yandex.ru"
SMTP_PASS = "ПАРОЛЬ_ПРИЛОЖЕНИЯ"
