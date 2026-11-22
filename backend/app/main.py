from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import chat, products, inquiries, whatsapp, surveys, auth, partners

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Backend service for Godavari Grown: RAG AI Chatbot, Product Catalog, WhatsApp API, Market Intelligence, and Partner Splitwise Ledger"
)

# CORS Middleware: Explicitly allow trusted origins and Vercel deployments (fixing wildcard with credentials)
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://godavarigrown.com",
    "https://www.godavarigrown.com",
    "https://gg-ui-phi.vercel.app"
]
for o in settings.CORS_ORIGINS:
    if o and o not in allowed_origins:
        allowed_origins.append(o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(chat.router)
app.include_router(products.router)
app.include_router(inquiries.router)
app.include_router(whatsapp.router)
app.include_router(surveys.router)
app.include_router(auth.router)
app.include_router(partners.router)

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
