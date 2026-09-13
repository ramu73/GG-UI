from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import chat, products, inquiries, whatsapp

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Backend service for Godavari Grown: RAG AI Chatbot, Product Catalog, and WhatsApp Business API"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open for development and frontend dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(chat.router)
app.include_router(products.router)
app.include_router(inquiries.router)
app.include_router(whatsapp.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "brand": "Godavari Grown (GG)",
        "service": "RAG AI & WhatsApp Business Backend",
        "endpoints": [
            "/api/chat",
            "/api/products",
            "/api/inquiries",
            "/api/webhook",
            "/docs"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "env": settings.APP_ENV}
