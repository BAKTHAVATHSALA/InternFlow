from ai.gemini_client import generate_smart_notification
from sqlalchemy.orm import Session
from models.others import Notification

def send_status_notification(db: Session, user_id: int, status: str, candidate_name: str):
    # Generate AI content
    content = generate_smart_notification(status, candidate_name)
    
    # Save to database
    notification = Notification(
        user_id=user_id,
        title=f"Application Update: {status}",
        content=content
    )
    db.add(notification)
    db.commit()
    return notification
