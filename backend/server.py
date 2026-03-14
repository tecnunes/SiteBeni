from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
SECRET_KEY = os.environ.get('JWT_SECRET', 'beni-restaurant-secret-key-2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# --- MODELS ---

class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminResponse

class WeeklyDish(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name_fr: str
    name_en: str
    name_pt: str
    description_fr: str = ""
    description_en: str = ""
    description_pt: str = ""
    category: str  # "meat", "vegetarian", "seafood", "dessert"
    image_url: str = ""

class WeeklyMenuData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    week_start: str  # ISO date string
    week_end: str
    dishes: List[WeeklyDish] = []
    price_full: float = 28.90  # Entrée + Plat + Dessert
    price_entree_plat: float = 24.90
    price_plat_dessert: float = 23.90
    price_plat_only: float = 17.90
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class WeeklyMenuCreate(BaseModel):
    week_start: str
    week_end: str
    dishes: List[WeeklyDish] = []
    price_full: float = 28.90
    price_entree_plat: float = 24.90
    price_plat_dessert: float = 23.90
    price_plat_only: float = 17.90

class SiteImage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    key: str  # "hero", "chef", "food1", "food2", etc.
    url: str
    alt_fr: str = ""
    alt_en: str = ""
    alt_pt: str = ""

class SiteSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "main"
    restaurant_name: str = "BÉNI"
    tagline_fr: str = "Food is Life"
    tagline_en: str = "Food is Life"
    tagline_pt: str = "Comida é Vida"
    address: str = "22 Rue de l'industrie, L 8399 Windhof"
    phone: str = "+352 661 250 004"
    email: str = "beniluxembourg@gmail.com"
    hours_fr: str = "Lundi à Samedi 11h30-14h30, Jeudi à Samedi 17h00-22h00"
    hours_en: str = "Monday to Saturday 11:30-14:30, Thursday to Saturday 17:00-22:00"
    hours_pt: str = "Segunda a Sábado 11:30-14:30, Quinta a Sábado 17:00-22:00"
    images: List[SiteImage] = []
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ReservationCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    date: str
    time: str
    guests: int
    notes: str = ""

class Reservation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    date: str
    time: str
    guests: int
    notes: str = ""
    status: str = "pending"  # pending, confirmed, cancelled
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# --- HELPER FUNCTIONS ---

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        admin_id = payload.get("sub")
        if admin_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        admin = await db.admins.find_one({"id": admin_id}, {"_id": 0})
        if admin is None:
            raise HTTPException(status_code=401, detail="Admin not found")
        return admin
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- AUTH ROUTES ---

@api_router.post("/auth/register", response_model=TokenResponse)
async def register_admin(data: AdminCreate):
    # Check if admin exists
    existing = await db.admins.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    admin_id = str(uuid.uuid4())
    admin_doc = {
        "id": admin_id,
        "email": data.email,
        "password": hash_password(data.password),
        "name": data.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.admins.insert_one(admin_doc)
    
    token = create_access_token({"sub": admin_id})
    return TokenResponse(
        access_token=token,
        admin=AdminResponse(
            id=admin_id,
            email=data.email,
            name=data.name,
            created_at=admin_doc["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login_admin(data: AdminLogin):
    admin = await db.admins.find_one({"email": data.email}, {"_id": 0})
    if not admin or not verify_password(data.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": admin["id"]})
    return TokenResponse(
        access_token=token,
        admin=AdminResponse(
            id=admin["id"],
            email=admin["email"],
            name=admin["name"],
            created_at=admin["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=AdminResponse)
async def get_me(admin: dict = Depends(get_current_admin)):
    return AdminResponse(
        id=admin["id"],
        email=admin["email"],
        name=admin["name"],
        created_at=admin["created_at"]
    )

# --- WEEKLY MENU ROUTES ---

@api_router.get("/weekly-menu", response_model=Optional[WeeklyMenuData])
async def get_active_weekly_menu():
    menu = await db.weekly_menus.find_one({"is_active": True}, {"_id": 0})
    return menu

@api_router.get("/weekly-menu/all", response_model=List[WeeklyMenuData])
async def get_all_weekly_menus(admin: dict = Depends(get_current_admin)):
    menus = await db.weekly_menus.find({}, {"_id": 0}).sort("week_start", -1).to_list(100)
    return menus

@api_router.post("/weekly-menu", response_model=WeeklyMenuData)
async def create_weekly_menu(data: WeeklyMenuCreate, admin: dict = Depends(get_current_admin)):
    # Deactivate all other menus
    await db.weekly_menus.update_many({}, {"$set": {"is_active": False}})
    
    menu = WeeklyMenuData(
        week_start=data.week_start,
        week_end=data.week_end,
        dishes=data.dishes,
        price_full=data.price_full,
        price_entree_plat=data.price_entree_plat,
        price_plat_dessert=data.price_plat_dessert,
        price_plat_only=data.price_plat_only,
        is_active=True
    )
    await db.weekly_menus.insert_one(menu.model_dump())
    return menu

@api_router.put("/weekly-menu/{menu_id}", response_model=WeeklyMenuData)
async def update_weekly_menu(menu_id: str, data: WeeklyMenuCreate, admin: dict = Depends(get_current_admin)):
    update_data = data.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.weekly_menus.update_one(
        {"id": menu_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Menu not found")
    
    menu = await db.weekly_menus.find_one({"id": menu_id}, {"_id": 0})
    return menu

@api_router.delete("/weekly-menu/{menu_id}")
async def delete_weekly_menu(menu_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.weekly_menus.delete_one({"id": menu_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Menu not found")
    return {"message": "Menu deleted"}

# --- SITE SETTINGS ROUTES ---

@api_router.get("/settings", response_model=SiteSettings)
async def get_site_settings():
    settings = await db.site_settings.find_one({"id": "main"}, {"_id": 0})
    if not settings:
        # Return default settings
        default = SiteSettings()
        return default
    return settings

@api_router.put("/settings", response_model=SiteSettings)
async def update_site_settings(data: SiteSettings, admin: dict = Depends(get_current_admin)):
    data.id = "main"
    data.updated_at = datetime.now(timezone.utc).isoformat()
    
    await db.site_settings.update_one(
        {"id": "main"},
        {"$set": data.model_dump()},
        upsert=True
    )
    return data

# --- RESERVATIONS ROUTES ---

@api_router.post("/reservations", response_model=Reservation)
async def create_reservation(data: ReservationCreate):
    reservation = Reservation(
        name=data.name,
        email=data.email,
        phone=data.phone,
        date=data.date,
        time=data.time,
        guests=data.guests,
        notes=data.notes
    )
    await db.reservations.insert_one(reservation.model_dump())
    return reservation

@api_router.get("/reservations", response_model=List[Reservation])
async def get_reservations(admin: dict = Depends(get_current_admin)):
    reservations = await db.reservations.find({}, {"_id": 0}).sort("date", -1).to_list(1000)
    return reservations

@api_router.put("/reservations/{reservation_id}/status")
async def update_reservation_status(reservation_id: str, status: str, admin: dict = Depends(get_current_admin)):
    if status not in ["pending", "confirmed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.reservations.update_one(
        {"id": reservation_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return {"message": "Status updated"}

@api_router.delete("/reservations/{reservation_id}")
async def delete_reservation(reservation_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.reservations.delete_one({"id": reservation_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return {"message": "Reservation deleted"}

# --- ROOT ROUTE ---

@api_router.get("/")
async def root():
    return {"message": "BÉNI Restaurant API", "status": "online"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
