from datetime import datetime
from typing import Literal, Optional

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


class IssueReportCreate(BaseModel):
    location_id: int
    issue_type: Literal["path_blocked", "other_issue"]
    note: Optional[str] = Field(None, max_length=500)


class IssueReportOut(BaseModel):
    id: int
    location_id: int
    issue_type: str
    note: Optional[str]
    timestamp: datetime


class BlockageCreate(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    location_id: Optional[int] = None
    note: Optional[str] = Field(None, max_length=500)
    # Minutes until this auto-expires. Omitted/null = "until cleared" (no
    # auto-expiry) -- the duration dropdown's three options map to
    # 15, 60, or None.
    duration_minutes: Optional[int] = Field(None, ge=1, le=1440)


class BlockageOut(BaseModel):
    id: int
    location_id: Optional[int]
    location_name: Optional[str] = None
    lat: float
    lng: float
    note: Optional[str]
    timestamp: datetime
    expires_at: Optional[datetime]
