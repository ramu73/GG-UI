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
    try:
        result = await rag_service.generate_answer(
            query=request.message,
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
