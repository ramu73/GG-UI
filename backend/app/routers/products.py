from fastapi import APIRouter
from typing import List, Optional
from app.models.schemas import ProductItem

router = APIRouter(prefix="/api/products", tags=["Products"])

CATALOG = [
    {
        "id": "milky-mushroom",
        "name": "Godavari Milky White Mushroom",
        "scientific_name": "Calocybe indica",
        "category": "fresh",
        "description": "Firm, thick, meaty culinary mushrooms native to tropical climates with up to 5 days shelf life.",
        "delivery_region": "East & West Godavari (24h Express)",
        "pricing": {"200g": 45, "500g": 105, "1kg": 199, "5kg Crate (B2B)": 850},
        "in_stock": True
    },
    {
        "id": "pearl-oyster",
        "name": "Fresh Pearl & Blue Oyster",
        "scientific_name": "Pleurotus ostreatus",
        "category": "fresh",
        "description": "Tender velvety clusters with natural lovastatin. Cooks in 3 minutes.",
        "delivery_region": "East & West Godavari (24h Express)",
        "pricing": {"200g": 50, "500g": 115, "1kg": 215, "5kg Crate (B2B)": 920},
        "in_stock": True
    },
    {
        "id": "white-button",
        "name": "Classic White Button Mushrooms",
        "scientific_name": "Agaricus bisporus",
        "category": "fresh",
        "description": "Plump, closed-cup button mushrooms grown in pristine climate chambers.",
        "delivery_region": "East & West Godavari (24h Express)",
        "pricing": {"200g": 55, "500g": 125, "1kg": 235, "5kg Crate (B2B)": 990},
        "in_stock": True
    },
    {
        "id": "diy-grow-kit",
        "name": "DIY Oyster Mushroom Home Grow Kit",
        "scientific_name": "Grow At Home",
        "category": "kits",
        "description": "All-in-one organic fruiting block with glass amber misting bottle. Harvest in 10 days.",
        "delivery_region": "All-India Courier Delivery",
        "pricing": {"Single Kit": 499, "Twin Pack": 899, "Family 3-Pack": 1250},
        "in_stock": True
    },
    {
        "id": "lions-mane-extract",
        "name": "Pure Lion's Mane Extract Powder",
        "scientific_name": "Hericium erinaceus",
        "category": "medicinal",
        "description": "100% pure organic fruiting body extract for focus, memory, and cognitive vitality.",
        "delivery_region": "All-India Courier Delivery",
        "pricing": {"100g Jar": 799, "200g Refill": 1450},
        "in_stock": True
    }
]

@router.get("", response_model=List[ProductItem])
async def get_products(category: Optional[str] = None):
    if category and category != "all":
        return [p for p in CATALOG if p["category"] == category]
    return CATALOG
