import os

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://synco_user:secret_password@localhost:5432/synco_db"
)

TG_TOKEN = "ВАШ_ТЕЛЕГРАМ_ТОКЕН"
VK_TOKEN = "ВАШ_ВК_ТОКЕН"

SMTP_HOST = "smtp.yandex.ru"
SMTP_PORT = 465
SMTP_USER = "family-bot@yandex.ru"
SMTP_PASS = "ПАРОЛЬ_ПРИЛОЖЕНИЯ"
