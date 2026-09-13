from fastapi import APIRouter, Request, Response, Query
from app.config import settings
from app.services.whatsapp_service import whatsapp_service
from app.services.rag_service import rag_service

router = APIRouter(prefix="/api/webhook", tags=["WhatsApp Webhook"])

@router.get("")
async def verify_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token")
):
    """
    Verification endpoint required by Meta Cloud API when registering webhooks.
    """
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_VERIFY_TOKEN:
        return Response(content=hub_challenge, media_type="text/plain")
    return Response(content="Verification token mismatch", status_code=403)

@router.post("")
async def handle_whatsapp_incoming(request: Request):
    """
    Receives incoming WhatsApp messages from customers, retrieves RAG context,
    and automatically responds on WhatsApp.
    """
    try:
        body = await request.json()
        parsed = whatsapp_service.parse_incoming_webhook(body)

        if parsed and parsed.get("text"):
            sender = parsed["from_number"]
            customer_query = parsed["text"]

            # 1. Query RAG engine for knowledge-grounded answer
            rag_result = await rag_service.generate_answer(customer_query)
            reply_text = rag_result["reply"]

            # Append farm hotline note
            reply_text += f"\n\n—\n🌱 Godavari Grown Fresh Basin Harvest"

            # 2. Reply to customer via WhatsApp Cloud API
            await whatsapp_service.send_message(sender, reply_text)

        return {"status": "received"}
    except Exception as e:
        print(f"Error handling WhatsApp webhook: {e}")
        return {"status": "error", "detail": str(e)}
