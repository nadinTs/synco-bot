import requests
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from backend.config import TG_TOKEN, VK_TOKEN, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

async def send_email_alerts(subject: str, text: str):
    emails = ["mom@mail.ru", "dad@gmail.com"] 
    msg = MIMEMultipart()
    msg["From"] = SMTP_USER
    msg["To"] = ", ".join(emails)
    msg["Subject"] = subject
    msg.attach(MIMEText(text, "plain"))
    try:
        await aiosmtplib.send(msg, hostname=SMTP_HOST, port=SMTP_PORT, username=SMTP_USER, password=SMTP_PASS, use_tls=True)
    except Exception as e:
        print(f"Ошибка отправки Email: {e}")

def send_messenger_broadcast(text: str):
    # Telegram Push
    try:
        requests.post(f"https://telegram.org{TG_TOKEN}/sendMessage", json={"chat_id": -1001234567, "text": text}, timeout=5)
    except Exception as e:
        print(f"Ошибка отправки в TG: {e}")
        
    # VK Push
    try:
        requests.get("https://vk.com", params={"access_token": VK_TOKEN, "peer_id": 2000000001, "message": text, "random_id": 0, "v": "5.131"}, timeout=5)
    except Exception as e:
        print(f"Ошибка отправки в VK: {e}")
