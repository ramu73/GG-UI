import hmac
import hashlib
from fastapi import APIRouter, Request, Response, Query, HTTPException, status
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
    Validates Meta X-Hub-Signature-256 HMAC when WHATSAPP_APP_SECRET is configured.
    """
    try:
        raw_body = await request.body()

        # Cryptographic signature validation
        if settings.WHATSAPP_APP_SECRET:
            signature = request.headers.get("X-Hub-Signature-256", "")
            if not signature.startswith("sha256="):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid signature format.")
            expected_sig = "sha256=" + hmac.new(
                settings.WHATSAPP_APP_SECRET.encode(),
                raw_body,
                hashlib.sha256
            ).hexdigest()
            if not hmac.compare_digest(signature, expected_sig):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Webhook signature mismatch.")

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
