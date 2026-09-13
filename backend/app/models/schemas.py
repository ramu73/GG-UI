from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ChatRequest(BaseModel):
    message: str = Field(..., description="User question or query")
    session_id: Optional[str] = Field("web_guest", description="Session identifier")
    language: Optional[str] = Field("en", description="Preferred language (en, te, hi)")

class ChatResponse(BaseModel):
    reply: str
    sources: List[str] = []
    whatsapp_cta: Optional[str] = None
    suggested_prompts: List[str] = []

class ProductItem(BaseModel):
    id: str
    name: str
    scientific_name: str
    category: str
    description: str
    delivery_region: str
    pricing: Dict[str, int]
    in_stock: bool

class B2BInquiryRequest(BaseModel):
    business_name: str
    contact_person: str
    phone: str
    variety: str
    weekly_volume: str
    location: str
    notes: Optional[str] = None

class InquiryResponse(BaseModel):
    status: str
    message: str
    inquiry_id: str
    whatsapp_redirect_url: str

# WhatsApp Webhook Schemas
class WhatsAppMessage(BaseModel):
    from_number: str
    message_id: str
    text: str
    timestamp: str
