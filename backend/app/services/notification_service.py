from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.models.subject import Subject
from app.models.user import User


REMINDER_TEMPLATES = {
    "ar": {
        7: ("تذكير اختبار", "اختبار {subject} بعد أسبوع! ابدأ مراجعتك الآن"),
        3: ("تذكير اختبار", "تذكير: اختبار {subject} يوم {date}"),
        1: ("اختبار غداً!", "غداً اختبارك! هل راجعت الـ Cheat Sheet؟"),
        0: ("يوم الاختبار", "حظ موفق في اختبار {subject} اليوم!"),
    },
    "en": {
        7: ("Exam Reminder", "{subject} exam in 1 week! Start reviewing now"),
        3: ("Exam Reminder", "Reminder: {subject} exam on {date}"),
        1: ("Exam Tomorrow!", "Exam tomorrow! Review the Cheat Sheet?"),
        0: ("Exam Day", "Good luck on {subject} exam today!"),
    }
}


def schedule_exam_reminders(db: Session, subject: Subject, user: User):
    """Create notification records for exam reminders."""
    if not subject.exam_date:
        return

    lang = user.language or "ar"
    templates = REMINDER_TEMPLATES.get(lang, REMINDER_TEMPLATES["ar"])
    exam_date = subject.exam_date

    # Delete old reminders for this subject
    db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.subject_id == subject.id,
        Notification.type == "exam_reminder",
        Notification.is_read == False
    ).delete()

    for days_before, (title, body_template) in templates.items():
        scheduled_at = exam_date - timedelta(days=days_before)
        if scheduled_at <= datetime.utcnow():
            continue  # Skip past dates

        body = body_template.format(
            subject=subject.name,
            date=exam_date.strftime("%Y-%m-%d")
        )

        notification = Notification(
            user_id=user.id,
            subject_id=subject.id,
            type="exam_reminder",
            title=title,
            body=body,
            scheduled_at=scheduled_at,
        )
        db.add(notification)

    db.commit()


def get_pending_notifications(db: Session) -> list:
    """Get notifications that should be sent now."""
    now = datetime.utcnow()
    return db.query(Notification).filter(
        Notification.scheduled_at <= now,
        Notification.sent_at == None,
        Notification.is_read == False
    ).all()


def mark_notification_sent(db: Session, notification_id: str):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if notif:
        notif.sent_at = datetime.utcnow()
        db.commit()
