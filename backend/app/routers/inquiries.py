import uuid
import urllib.parse
from fastapi import APIRouter
from app.models.schemas import B2BInquiryRequest, InquiryResponse
from app.config import settings

router = APIRouter(prefix="/api/inquiries", tags=["Inquiries"])

# In-memory storage for development (in production, saved to PostgreSQL)
INQUIRIES_DB = []

@router.post("", response_model=InquiryResponse)
async def create_b2b_inquiry(inquiry: B2BInquiryRequest):
    """
    Captures commercial B2B inquiries and generates an instant WhatsApp conversation link.
    """
    inquiry_id = f"INQ-{uuid.uuid4().hex[:8].upper()}"
    record = inquiry.dict()
    record["id"] = inquiry_id
    INQUIRIES_DB.append(record)

    # Format prefilled WhatsApp message
    msg = (
        f"Hello Godavari Grown! 🍄\n"
        f"New Wholesale Inquiry [{inquiry_id}]:\n"
        f"- Business: {inquiry.business_name}\n"
        f"- Contact: {inquiry.contact_person} ({inquiry.phone})\n"
        f"- Variety: {inquiry.variety}\n"
        f"- Volume: {inquiry.weekly_volume}\n"
        f"- Delivery Location: {inquiry.location}"
    )
    encoded_msg = urllib.parse.quote(msg)
    wa_url = f"https://wa.me/{settings.WHATSAPP_BUSINESS_PHONE.replace('+', '')}?text={encoded_msg}"

    return InquiryResponse(
        status="success",
        message="Inquiry recorded successfully. You can now chat directly on WhatsApp.",
        inquiry_id=inquiry_id,
        whatsapp_redirect_url=wa_url
    )
