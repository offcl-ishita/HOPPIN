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
