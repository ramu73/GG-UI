from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ChatRequest(BaseModel):
    message: str = Field(..., description="User question or query")
    session_id: Optional[str] = Field("web_guest", description="Session identifier")
    language: Optional[str] = Field("en", description="Preferred language (en, te, hi)")

class ChatResponse(BaseModel):
    reply: str
    sources: List[str] = []
    whatsapp_cta: Optional[str] = None
    suggested_prompts: List[str] = []

class ProductItem(BaseModel):
    id: str
    name: str
    scientific_name: str
    category: str
    description: str
    delivery_region: str
    pricing: Dict[str, int]
    in_stock: bool

class B2BInquiryRequest(BaseModel):
    business_name: str
    contact_person: str
    phone: str
    variety: str
    weekly_volume: str
    location: str
    notes: Optional[str] = None

class InquiryResponse(BaseModel):
    status: str
    message: str
    inquiry_id: str
    whatsapp_redirect_url: str

# WhatsApp Webhook Schemas
class WhatsAppMessage(BaseModel):
    from_number: str
    message_id: str
    text: str
    timestamp: str

# Ground Market Survey & Sourcing Intelligence Schemas
class MarketSurveyCreate(BaseModel):
    vendor_name: str = Field(..., description="Name of business, vendor, or store")
    vendor_type: str = Field("Retailer", description="Retailer, Supermarket, Restaurant/HORECA, Wholesaler, Cloud Kitchen")
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    destination_area: str = Field(..., description="Target town/city where produce is consumed/sold")
    district: str = Field("East Godavari", description="District (East Godavari, West Godavari, Krishna, etc.)")
    pincode: Optional[str] = None
    gps_lat: Optional[float] = None
    gps_lng: Optional[float] = None
    product_category: str = Field("Mushrooms", description="Category: Mushrooms, Exotic Veggies, Common Veggies, Fruits, Hydroponics, Dairy, Other")
    product_name: str = Field(..., description="Specific product name (e.g. Milky Mushroom, Broccoli, Bell Pepper)")
    selling_volume_kg: float = Field(..., description="Volume sold or consumed")
    volume_period: Optional[str] = Field("Day", description="Period for consumption quantity: Day, Week, Month")
    frequency: str = Field("Daily", description="Frequency: Daily, Weekly, Monthly")
    source_location: str = Field(..., description="Where vendor buys it from (e.g., Bangalore Wholesale, Hyderabad Mandi, Vijayawada)")
    source_distance_km: Optional[int] = Field(0, description="Approximate transit distance from source")
    buying_price_per_kg: float = Field(..., description="Purchase price per kg")
    selling_price_per_kg: Optional[float] = Field(None, description="Selling price per kg")
    pain_points: List[str] = Field(default_factory=list, description="Quality drop, transit spoilage, irregular supply, etc.")
    notes: Optional[str] = None

class MarketSurveyItem(MarketSurveyCreate):
    id: str
    timestamp: str
    monthly_volume_kg: float

class AreaDemandSummary(BaseModel):
    area: str
    district: str
    total_monthly_kg: float
    top_products: List[Dict[str, Any]] = []
    top_sources: List[str] = []

class SupplyRouteFlow(BaseModel):
    source_location: str
    destination_area: str
    product_name: str
    monthly_volume_kg: float
    avg_buying_price: float
    distance_km: int
    transit_risk: str

class SurveyAnalyticsResponse(BaseModel):
    total_surveys: int
    total_monthly_demand_kg: float
    total_annual_value_inr: float
    external_dependency_percentage: float
    area_demands: List[AreaDemandSummary]
    supply_routes: List[SupplyRouteFlow]
    high_opportunity_gaps: List[Dict[str, Any]]

# Authentication & Admin Schemas
class AdminLoginRequest(BaseModel):
    passcode: str = Field(..., description="Administrator passcode")

class OAuthVerifyRequest(BaseModel):
    provider: str = Field(..., description="google or facebook")
    token: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    avatar: Optional[str] = None

class AuthUserResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = ""
    provider: str
    role: str # 'admin' | 'user'
    title: Optional[str] = None

class AuthTokenResponse(BaseModel):
    status: str
    token: str
    user: AuthUserResponse

# Partner Ledger & Splitwise Schemas
class PartnerCreate(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., description="Partner's full name")
    email: Optional[str] = ""
    phone: Optional[str] = ""
    color: Optional[str] = "#10b981"
    initial_equity_target: Optional[float] = 33.33

class PartnerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    color: Optional[str] = None
    initial_equity_target: Optional[float] = None

class PartnerResponse(BaseModel):
    id: str
    name: str
    email: Optional[str] = ""
    phone: Optional[str] = ""
    color: str
    initial_equity_target: float
    created_at: Optional[str] = None

class PartnerTransactionCreate(BaseModel):
    id: Optional[str] = None
    type: str = Field(..., description="investment, expense, or settlement")
    date: str
    title: str
    amount: float
    paidBy: Optional[str] = ""
    payerId: Optional[str] = ""
    receiverId: Optional[str] = ""
    category: Optional[str] = ""
    splitMode: Optional[str] = "equal"
    participantIds: Optional[List[str]] = []
    splits: Optional[Dict[str, float]] = None
    notes: Optional[str] = ""

class PartnerTransactionResponse(BaseModel):
    id: str
    type: str
    date: str
    title: str
    amount: float
    paidBy: Optional[str] = ""
    payerId: Optional[str] = ""
    receiverId: Optional[str] = ""
    category: Optional[str] = ""
    splitMode: Optional[str] = "equal"
    participantIds: Optional[List[str]] = []
    splits: Optional[Dict[str, float]] = None
    notes: Optional[str] = ""
    created_at: Optional[str] = None


