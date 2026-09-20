import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Query
from app.models.schemas import (
    MarketSurveyCreate,
    MarketSurveyItem,
    SurveyAnalyticsResponse,
    AreaDemandSummary,
    SupplyRouteFlow
)

router = APIRouter(prefix="/api/surveys", tags=["Market Surveys & Geo-Intelligence"])

# In-memory database pre-seeded with realistic Godavari Basin and AP/Telangana ground market research data
INITIAL_BENCHMARK_SURVEYS = [
    {
        "id": "SRV-GOD-001",
        "timestamp": "2026-09-15T09:30:00Z",
        "vendor_name": "Sri Lakshmi Vegetable & Mushroom Wholesalers",
        "vendor_type": "Wholesaler",
        "contact_person": "R. Satyanarayana",
        "phone": "+91 98480 12345",
        "destination_area": "Kakinada",
        "district": "East Godavari",
        "pincode": "533001",
        "gps_lat": 16.9891,
        "gps_lng": 82.2475,
        "product_category": "Mushrooms",
        "product_name": "White Button Mushroom",
        "selling_volume_kg": 45.0,
        "frequency": "Daily",
        "monthly_volume_kg": 1350.0,
        "source_location": "Bangalore Wholesale Mandi",
        "source_distance_km": 680,
        "buying_price_per_kg": 175.0,
        "selling_price_per_kg": 230.0,
        "pain_points": ["Transit Spoilage (10-15%)", "Price Volatility", "2-Day Delivery Lag"],
        "notes": "Retailers complain about browning mushrooms due to overnight non-AC transit from Karnataka."
    },
    {
        "id": "SRV-GOD-002",
        "timestamp": "2026-09-15T11:15:00Z",
        "vendor_name": "Godavari Grand Banquet & Kitchens",
        "vendor_type": "Restaurant/HORECA",
        "contact_person": "Chef Murthy",
        "phone": "+91 99890 54321",
        "destination_area": "Rajahmundry",
        "district": "East Godavari",
        "pincode": "533101",
        "gps_lat": 17.0005,
        "gps_lng": 81.8040,
        "product_category": "Mushrooms",
        "product_name": "Milky Mushroom (Calocybe)",
        "selling_volume_kg": 25.0,
        "frequency": "Daily",
        "monthly_volume_kg": 750.0,
        "source_location": "Hyderabad Wholesale Market",
        "source_distance_km": 430,
        "buying_price_per_kg": 190.0,
        "selling_price_per_kg": 260.0,
        "pain_points": ["Irregular Supply", "High Freight Charges"],
        "notes": "Great demand for Indian curries and biryanis; local stock runs out by afternoon."
    },
    {
        "id": "SRV-GOD-003",
        "timestamp": "2026-09-16T14:20:00Z",
        "vendor_name": "Fresh Basket Gourmet Store",
        "vendor_type": "Supermarket",
        "contact_person": "K. Srinivas",
        "phone": "+91 97011 88990",
        "destination_area": "Bhimavaram",
        "district": "West Godavari",
        "pincode": "534201",
        "gps_lat": 16.5449,
        "gps_lng": 81.5212,
        "product_category": "Exotic Veggies",
        "product_name": "Broccoli (Green)",
        "selling_volume_kg": 30.0,
        "frequency": "Daily",
        "monthly_volume_kg": 900.0,
        "source_location": "Bangalore Wholesale Mandi",
        "source_distance_km": 640,
        "buying_price_per_kg": 140.0,
        "selling_price_per_kg": 210.0,
        "pain_points": ["High Freight Cost", "Yellowing heads during transit"],
        "notes": "Aqua farm owners and doctors in Bhimavaram are regular buyers of health greens."
    },
    {
        "id": "SRV-GOD-004",
        "timestamp": "2026-09-16T16:45:00Z",
        "vendor_name": "Delta Agri Mart",
        "vendor_type": "Retailer",
        "contact_person": "V. Prasad",
        "phone": "+91 94401 22334",
        "destination_area": "Eluru",
        "district": "West Godavari",
        "pincode": "534001",
        "gps_lat": 16.7107,
        "gps_lng": 81.0952,
        "product_category": "Exotic Veggies",
        "product_name": "Bell Pepper (Red/Yellow)",
        "selling_volume_kg": 20.0,
        "frequency": "Daily",
        "monthly_volume_kg": 600.0,
        "source_location": "Hyderabad Mandi",
        "source_distance_km": 340,
        "buying_price_per_kg": 160.0,
        "selling_price_per_kg": 240.0,
        "pain_points": ["Frequent Stockouts", "Middleman Margin Markups"],
        "notes": "Ordered through Vijayawada intermediary who charges ₹25/kg commission."
    },
    {
        "id": "SRV-GOD-005",
        "timestamp": "2026-09-17T10:00:00Z",
        "vendor_name": "Annapurna Hotel Caterers",
        "vendor_type": "Restaurant/HORECA",
        "contact_person": "Ch. Venkat",
        "phone": "+91 93930 77112",
        "destination_area": "Vijayawada",
        "district": "Krishna",
        "pincode": "520001",
        "gps_lat": 16.5062,
        "gps_lng": 80.6480,
        "product_category": "Mushrooms",
        "product_name": "Oyster Mushroom (Pleurotus)",
        "selling_volume_kg": 50.0,
        "frequency": "Daily",
        "monthly_volume_kg": 1500.0,
        "source_location": "Local Small Farms (Intermittent)",
        "source_distance_km": 45,
        "buying_price_per_kg": 160.0,
        "selling_price_per_kg": 220.0,
        "pain_points": ["Inconsistent Daily Supply", "Lack of Certified Quality"],
        "notes": "Needs guaranteed 50kg/day fresh harvest with FSSAI certificate for catering contracts."
    },
    {
        "id": "SRV-GOD-006",
        "timestamp": "2026-09-17T15:30:00Z",
        "vendor_name": "Vizag Urban Greens Superstore",
        "vendor_type": "Supermarket",
        "contact_person": "S. Anita",
        "phone": "+91 91000 66554",
        "destination_area": "Visakhapatnam",
        "district": "Visakhapatnam",
        "pincode": "530002",
        "gps_lat": 17.6868,
        "gps_lng": 83.2185,
        "product_category": "Mushrooms",
        "product_name": "White Button Mushroom",
        "selling_volume_kg": 80.0,
        "frequency": "Daily",
        "monthly_volume_kg": 2400.0,
        "source_location": "Ooty / Bengaluru Cold Logistics",
        "source_distance_km": 850,
        "buying_price_per_kg": 185.0,
        "selling_price_per_kg": 250.0,
        "pain_points": ["High Carbon Footprint", "Refrigeration breakdown damages stock"],
        "notes": "Looking for regional Godavari farm supplier with same-day express dispatch."
    },
    {
        "id": "SRV-GOD-007",
        "timestamp": "2026-09-18T12:00:00Z",
        "vendor_name": "Konaseema Organic Store",
        "vendor_type": "Retailer",
        "contact_person": "M. Subba Rao",
        "phone": "+91 98855 44321",
        "destination_area": "Amalapuram",
        "district": "East Godavari",
        "pincode": "533201",
        "gps_lat": 16.5787,
        "gps_lng": 82.0061,
        "product_category": "Fruits",
        "product_name": "Dragon Fruit (Red Flesh)",
        "selling_volume_kg": 15.0,
        "frequency": "Daily",
        "monthly_volume_kg": 450.0,
        "source_location": "Hyderabad Fruit Mandi",
        "source_distance_km": 490,
        "buying_price_per_kg": 130.0,
        "selling_price_per_kg": 190.0,
        "pain_points": ["Bruising in Transit", "High Transport Cost"],
        "notes": "Willing to source locally grown organic fruits directly from Godavari cultivators."
    }
]

from app.config import settings

SURVEYS_DB: List[dict] = list(INITIAL_BENCHMARK_SURVEYS) if settings.ENABLE_DEMO_DATA else []


def calculate_monthly_volume(volume: float, frequency: str) -> float:
    freq = (frequency or "").lower()
    if "daily" in freq:
        return round(volume * 30.0, 1)
    elif "weekly" in freq:
        return round(volume * 4.33, 1)
    return round(volume, 1)


@router.post("", response_model=MarketSurveyItem)
async def create_survey(survey: MarketSurveyCreate):
    """
    Submits a new ground survey record capturing vendor demands, geography, and sourcing origins.
    """
    survey_id = f"SRV-GG-{uuid.uuid4().hex[:6].upper()}"
    monthly_vol = calculate_monthly_volume(survey.selling_volume_kg, survey.frequency)
    
    item = {
        **survey.dict(),
        "id": survey_id,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "monthly_volume_kg": monthly_vol
    }
    
    SURVEYS_DB.append(item)
    return item


@router.get("", response_model=List[MarketSurveyItem])
async def list_surveys(
    category: Optional[str] = Query(None, description="Filter by product category"),
    area: Optional[str] = Query(None, description="Filter by destination town/area"),
    district: Optional[str] = Query(None, description="Filter by district")
):
    """
    Retrieves all ground survey entries with optional filters.
    """
    results = SURVEYS_DB
    if category and category.lower() != "all":
        results = [s for s in results if s.get("product_category", "").lower() == category.lower()]
    if area and area.lower() != "all":
        results = [s for s in results if s.get("destination_area", "").lower() == area.lower()]
    if district and district.lower() != "all":
        results = [s for s in results if s.get("district", "").lower() == district.lower()]
    return results


@router.delete("")
async def clear_surveys():
    """
    Clears all survey records (useful to wipe demo data for production deployment).
    """
    global SURVEYS_DB
    SURVEYS_DB.clear()
    return {"status": "success", "message": "All survey records cleared."}


@router.post("/reset-demo")
async def reset_demo_surveys():
    """
    Resets survey database to benchmark demo entries.
    """
    global SURVEYS_DB
    SURVEYS_DB = list(INITIAL_BENCHMARK_SURVEYS)
    return {"status": "success", "message": "Reset to benchmark demo data.", "count": len(SURVEYS_DB)}



@router.get("/analytics", response_model=SurveyAnalyticsResponse)
async def get_market_analytics():
    """
    Aggregates survey data into geographic demand requirements, external supply flows, and arbitrage opportunities.
    """
    total_surveys = len(SURVEYS_DB)
    total_monthly_demand_kg = sum(s.get("monthly_volume_kg", 0.0) for s in SURVEYS_DB)
    
    # Calculate estimated annual market value
    total_annual_value_inr = sum(
        s.get("monthly_volume_kg", 0.0) * (s.get("selling_price_per_kg") or s.get("buying_price_per_kg", 100)) * 12
        for s in SURVEYS_DB
    )

    # Calculate external dependency: distance > 100 km considered external imported produce
    external_vol = sum(
        s.get("monthly_volume_kg", 0.0)
        for s in SURVEYS_DB
        if s.get("source_distance_km", 0) > 100
    )
    ext_percentage = round((external_vol / total_monthly_demand_kg * 100), 1) if total_monthly_demand_kg > 0 else 0.0

    # Group demand by Destination Area
    area_map = {}
    for s in SURVEYS_DB:
        area = s.get("destination_area", "Other")
        dist = s.get("district", "General")
        vol = s.get("monthly_volume_kg", 0.0)
        prod = s.get("product_name", "Unknown")
        src = s.get("source_location", "Unknown")

        if area not in area_map:
            area_map[area] = {
                "area": area,
                "district": dist,
                "total_monthly_kg": 0.0,
                "products": {},
                "sources": set()
            }
        area_map[area]["total_monthly_kg"] += vol
        area_map[area]["products"][prod] = area_map[area]["products"].get(prod, 0.0) + vol
        area_map[area]["sources"].add(src)

    area_demands = []
    for area, data in area_map.items():
        sorted_prods = sorted(
            [{"name": k, "volume_kg": round(v, 1)} for k, v in data["products"].items()],
            key=lambda x: x["volume_kg"],
            reverse=True
        )
        area_demands.append(
            AreaDemandSummary(
                area=area,
                district=data["district"],
                total_monthly_kg=round(data["total_monthly_kg"], 1),
                top_products=sorted_prods,
                top_sources=list(data["sources"])[:4]
            )
        )
    area_demands.sort(key=lambda x: x.total_monthly_kg, reverse=True)

    # Supply routes: Origin -> Destination -> Product
    routes_map = {}
    for s in SURVEYS_DB:
        key = (s.get("source_location"), s.get("destination_area"), s.get("product_name"))
        if key not in routes_map:
            routes_map[key] = {
                "source": s.get("source_location"),
                "destination": s.get("destination_area"),
                "product": s.get("product_name"),
                "volume": 0.0,
                "prices": [],
                "distance": s.get("source_distance_km", 0)
            }
        routes_map[key]["volume"] += s.get("monthly_volume_kg", 0.0)
        routes_map[key]["prices"].append(s.get("buying_price_per_kg", 0.0))

    supply_routes = []
    for r in routes_map.values():
        avg_price = sum(r["prices"]) / len(r["prices"]) if r["prices"] else 0.0
        dist = r["distance"]
        risk = "Severe Spoilage Risk (>500km)" if dist >= 500 else ("Medium Freight Delay (200-500km)" if dist >= 200 else "Local / Low Transit Risk")
        supply_routes.append(
            SupplyRouteFlow(
                source_location=r["source"],
                destination_area=r["destination"],
                product_name=r["product"],
                monthly_volume_kg=round(r["volume"], 1),
                avg_buying_price=round(avg_price, 1),
                distance_km=dist,
                transit_risk=risk
            )
        )
    supply_routes.sort(key=lambda x: x.monthly_volume_kg, reverse=True)

    # Identify high opportunity arbitrage gaps
    high_opportunity_gaps = []
    for r in supply_routes:
        if r.distance_km >= 200:
            # Estimate potential local farm gate savings and fresh delivery advantage
            estimated_local_cost = round(r.avg_buying_price * 0.75, 1)
            saving_per_kg = round(r.avg_buying_price - estimated_local_cost, 1)
            monthly_market_saving = round(saving_per_kg * r.monthly_volume_kg, 0)
            high_opportunity_gaps.append({
                "product_name": r.product_name,
                "destination_area": r.destination_area,
                "current_source": r.source_location,
                "distance_km": r.distance_km,
                "monthly_volume_kg": r.monthly_volume_kg,
                "current_buying_price": r.avg_buying_price,
                "potential_local_supply_price": estimated_local_cost,
                "potential_monthly_savings_inr": monthly_market_saving,
                "urgency": "High Demand & Distant Sourcing"
            })
    high_opportunity_gaps.sort(key=lambda x: x["potential_monthly_savings_inr"], reverse=True)

    return SurveyAnalyticsResponse(
        total_surveys=total_surveys,
        total_monthly_demand_kg=round(total_monthly_demand_kg, 1),
        total_annual_value_inr=round(total_annual_value_inr, 2),
        external_dependency_percentage=ext_percentage,
        area_demands=area_demands,
        supply_routes=supply_routes,
        high_opportunity_gaps=high_opportunity_gaps
    )
