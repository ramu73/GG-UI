import httpx
from typing import Dict, Any, Optional
from app.config import settings

class WhatsAppService:
    def __init__(self):
        self.phone_number_id = settings.WHATSAPP_PHONE_NUMBER_ID
        self.access_token = settings.WHATSAPP_ACCESS_TOKEN
        self.api_url = f"https://graph.facebook.com/v21.0/{self.phone_number_id}/messages"

    async def send_message(self, to_phone: str, text: str) -> bool:
        """
        Sends an automated WhatsApp message to a user via Meta WhatsApp Cloud API.
        """
        if not self.phone_number_id or not self.access_token:
            # Running in dev/mock mode
            print(f"[DEV MOCK] WhatsApp to {to_phone}: {text}")
            return True

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to_phone.replace("+", "").replace(" ", ""),
            "type": "text",
            "text": {"preview_url": False, "body": text}
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(self.api_url, headers=headers, json=payload)
                return resp.status_code in [200, 201]
        except Exception as e:
            print(f"Error sending WhatsApp message: {e}")
            return False

    def parse_incoming_webhook(self, payload: Dict[str, Any]) -> Optional[Dict[str, str]]:
        """
        Extracts sender phone and message text from Meta Cloud API incoming webhook.
        """
        try:
            entry = payload.get("entry", [])[0]
            change = entry.get("changes", [])[0]
            value = change.get("value", {})
            messages = value.get("messages", [])
            if messages:
                msg = messages[0]
                if msg.get("type") == "text":
                    return {
                        "from_number": msg.get("from"),
                        "message_id": msg.get("id"),
                        "text": msg.get("text", {}).get("body", ""),
                        "timestamp": msg.get("timestamp")
                    }
        except Exception as e:
            print(f"Error parsing webhook: {e}")
        return None

whatsapp_service = WhatsAppService()
