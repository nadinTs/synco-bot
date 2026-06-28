from typing import List
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.database.connection import engine, Base, get_db
from backend.database.models import DbEvent
from backend.schemas.event import EventCreateSchema, EventResponseSchema
from backend.core import notifier

# Создаем таблицы при старте, если их нет в Postgres
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Synco API",
    root_path="/api", # Это автоматически добавит /api ко ВСЕМ эндпоинтам ниже!
    docs_url="/docs",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Было /api/events -> Стало /events (префикс /api добавится автоматически!)
@app.get("/events", response_model=List[EventResponseSchema])
def get_week_events(db: Session = Depends(get_db)):
    return db.query(DbEvent).order_by(DbEvent.event_date).all()

@app.post("/events", response_model=EventResponseSchema)
async def create_event(event: EventCreateSchema, db: Session = Depends(get_db)):
    db_event = DbEvent(
        title=event.title,
        description=event.description,
        event_date=event.event_date,
        color_tag=event.color_tag,
        creator_name=event.creator_name
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    alert_msg = f"📅 {event.creator_name} добавил план: '{event.title}' на {event.event_date.strftime('%d.%m в %H:%M')}"
    notifier.send_messenger_broadcast(alert_msg)
    await notifier.send_email_alerts("Новый план", alert_msg)
    return db_event

@app.put("/events/{event_id}", response_model=EventResponseSchema)
async def update_event(event_id: int, event: EventCreateSchema, db: Session = Depends(get_db)):
    db_event = db.query(DbEvent).filter(DbEvent.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="План не найден")
        
    db_event.title = event.title
    db_event.description = event.description
    db_event.event_date = event.event_date
    db_event.color_tag = event.color_tag
    db_event.creator_name = event.creator_name
    db.commit()
    
    alert_msg = f"🔄 {event.creator_name} изменил план на: '{event.title}' ({event.event_date.strftime('%d.%m %H:%M')})"
    notifier.send_messenger_broadcast(alert_msg)
    await notifier.send_email_alerts("Обновление календаря", alert_msg)
    return db_event

@app.delete("/events/{event_id}")
async def delete_event(event_id: int, creator_name: str, db: Session = Depends(get_db)):
    db_event = db.query(DbEvent).filter(DbEvent.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="План не найден")
    
    deleted_title = db_event.title
    db.delete(db_event)
    db.commit()
    
    alert_msg = f"❌ {creator_name} удалил план '{deleted_title}' из календаря"
    notifier.send_messenger_broadcast(alert_msg)
    await notifier.send_email_alerts("Удаление из календаря", alert_msg)
    return {"status": "deleted", "id": event_id}
