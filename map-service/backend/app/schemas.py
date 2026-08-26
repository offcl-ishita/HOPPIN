from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CrowdReadingCreate(BaseModel):
    location_id: int
    density_percent: float = Field(..., ge=0, le=100)
    status_label: Optional[str] = None


class CrowdReadingOut(BaseModel):
    id: int
    location_id: int
    density_percent: float
    status_label: str
    timestamp: datetime
