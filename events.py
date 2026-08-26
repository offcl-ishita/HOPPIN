# backend/main.py
# Run with: uvicorn main:app --reload

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI(title="HOPPIN Events API")

# Define Data Models
class Event(BaseModel):
    id: str
    title: str
    category: str
    location: str
    date: str
    time: str
    is_rsvpd: bool

# Mock Database based on SRM KTR Campus specifics from the HOPPIN pitch
srm_events_db = [
    {
        "id": "e1",
        "title": "Milan - Annual Cultural Fest",
        "category": "Fest",
        "location": "TP Ganesan Auditorium", 
        "date": "Oct 12, 2026",
        "time": "10:00 AM - 10:00 PM",
        "is_rsvpd": False
    },
    {
        "id": "e2",
        "title": "ACM SIGAI Hackathon",
        "category": "Hackathon",
        "location": "Tech Park, 4th Floor",
        "date": "Oct 15, 2026",
        "time": "08:00 AM - 08:00 PM",
        "is_rsvpd": False
    },
    {
        "id": "e3",
        "title": "Robotics Club Recruitment",
        "category": "Club Workshop",
        "location": "University Building (UB)",
        "date": "Oct 18, 2026",
        "time": "04:30 PM - 06:30 PM",
        "is_rsvpd": False
    }
]

@app.get("/api/events", response_model=List[Event])
def get_upcoming_events():
    """Fetch all upcoming events at SRM KTR."""
    return srm_events_db

@app.post("/api/events/{event_id}/rsvp")
def toggle_rsvp(event_id: str):
    """Toggle the RSVP / Reminder status for a specific event."""
    for event in srm_events_db:
        if event["id"] == event_id:
            event["is_rsvpd"] = not event["is_rsvpd"]
            status = "RSVP Confirmed" if event["is_rsvpd"] else "RSVP Cancelled"
            return {"success": True, "message": status, "event": event}
            
    raise HTTPException(status_code=404, detail="Event not found on campus")
