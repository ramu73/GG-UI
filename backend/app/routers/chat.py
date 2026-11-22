from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.services.rag_service import rag_service

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
async def handle_chat_message(request: ChatRequest):
    """
    RAG-powered conversational endpoint for the Godavari Grown website chatbot.
    Retrieves grounded context from the knowledge base and generates an accurate answer.
    """
    msg = (request.message or "").strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    if len(msg) > 1000:
        raise HTTPException(status_code=400, detail="Message exceeds maximum allowed length of 1000 characters.")

    try:
        result = await rag_service.generate_answer(
            query=msg,
            language=request.language
        )
        return ChatResponse(
            reply=result["reply"],
            sources=result.get("sources", []),
            whatsapp_cta=result.get("whatsapp_cta"),
            suggested_prompts=result.get("suggested_prompts", [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating chat answer: {str(e)}")
