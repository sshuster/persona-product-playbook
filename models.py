
from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime

@dataclass
class Persona:
    id: str
    name: str
    role: str
    background: str
    expertise: List[str]

@dataclass
class Company:
    id: str
    name: str
    product: str
    description: str
    category: str

@dataclass
class Message:
    id: str
    type: str  # 'persona_question', 'user_suggestion', 'persona_response', 'system'
    content: str
    timestamp: datetime
    status: Optional[str] = None  # 'satisfied', 'needs_more', 'unclear'
