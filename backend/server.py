from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
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
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)

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
    email: str
    password: str
    name: str

class AdminLogin(BaseModel):
    email: str
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

# Menu Item Model (for full menu/cardápio)
class MenuItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str  # "starters", "mains", "seafood", "desserts", "drinks"
    name_fr: str
    name_en: str
    name_pt: str
    description_fr: str = ""
    description_en: str = ""
    description_pt: str = ""
    price: float
    image_url: str = ""
    is_available: bool = True
    sort_order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MenuItemCreate(BaseModel):
    category: str
    name_fr: str
    name_en: str
    name_pt: str
    description_fr: str = ""
    description_en: str = ""
    description_pt: str = ""
    price: float
    image_url: str = ""
    is_available: bool = True
    sort_order: int = 0

# Site Content Model (for texts)
class SiteContent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "main"
    # Hero Section
    hero_subtitle_fr: str = "Restaurant · Luxembourg"
    hero_subtitle_en: str = "Restaurant · Luxembourg"
    hero_subtitle_pt: str = "Restaurante · Luxemburgo"
    # About Section
    about_title_fr: str = "Notre Histoire"
    about_title_en: str = "Our History"
    about_title_pt: str = "Nossa História"
    about_text_fr: str = "Plus de 11 ans de cuisine professionnelle de haut niveau et une passion pour la cuisine et la pêche, Stephano Crupi a le défi de ravir les palais avec légèreté, qualité et amour."
    about_text_en: str = "Over 11 years of high-level professional cuisine and a passion for cooking and fishing, Stephano Crupi has the challenge of delighting palates with lightness, quality and love."
    about_text_pt: str = "Mais de 11 anos de cozinha profissional de alto nível e paixão por cozinhar e pescar, Stephano Crupi tem o desafio de encantar paladares com leveza, qualidade e amor."
    about_quote_fr: str = "Cuisiner, c'est comme tisser un délicat manteau d'arômes, de couleurs, de saveurs, de textures."
    about_quote_en: str = "Cooking is like weaving a delicate cloak of aromas, colors, flavors, textures."
    about_quote_pt: str = "Cozinhar é como tecer um delicado manto de aromas, cores, sabores, texturas."
    chef_name: str = "Stephano Crupi"
    # Images
    hero_image: str = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80"
    about_image_1: str = "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=600&q=80"
    about_image_2: str = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80"
    about_image_3: str = "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80"
    chef_image: str = "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800&q=80"
    reservation_bg_image: str = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80"
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Gallery Image Model
class GalleryImage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    category: str  # "ambiance", "dishes", "team"
    alt_fr: str = ""
    alt_en: str = ""
    alt_pt: str = ""
    sort_order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class GalleryImageCreate(BaseModel):
    url: str
    category: str
    alt_fr: str = ""
    alt_en: str = ""
    alt_pt: str = ""
    sort_order: int = 0

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
async def register_admin(data: AdminCreate, current_admin: dict = Depends(get_current_admin)):
    # Only authenticated admins can create new admins
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

@api_router.get("/auth/admins", response_model=List[AdminResponse])
async def get_all_admins(current_admin: dict = Depends(get_current_admin)):
    admins = await db.admins.find({}, {"_id": 0, "password": 0}).to_list(100)
    return [AdminResponse(**a) for a in admins]

@api_router.delete("/auth/admins/{admin_id}")
async def delete_admin(admin_id: str, current_admin: dict = Depends(get_current_admin)):
    # Prevent deleting yourself
    if current_admin["id"] == admin_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    result = await db.admins.delete_one({"id": admin_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admin not found")
    return {"message": "Admin deleted"}

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

# --- SITE CONTENT ROUTES ---

@api_router.get("/content", response_model=SiteContent)
async def get_site_content():
    content = await db.site_content.find_one({"id": "main"}, {"_id": 0})
    if not content:
        default = SiteContent()
        return default
    return content

@api_router.put("/content", response_model=SiteContent)
async def update_site_content(data: SiteContent, admin: dict = Depends(get_current_admin)):
    data.id = "main"
    data.updated_at = datetime.now(timezone.utc).isoformat()
    
    await db.site_content.update_one(
        {"id": "main"},
        {"$set": data.model_dump()},
        upsert=True
    )
    return data

# --- MENU ITEMS ROUTES (Cardápio Completo) ---

@api_router.get("/menu-items", response_model=List[MenuItem])
async def get_menu_items():
    items = await db.menu_items.find({}, {"_id": 0}).sort("sort_order", 1).to_list(500)
    return items

@api_router.get("/menu-items/{category}", response_model=List[MenuItem])
async def get_menu_items_by_category(category: str):
    items = await db.menu_items.find({"category": category}, {"_id": 0}).sort("sort_order", 1).to_list(100)
    return items

@api_router.post("/menu-items", response_model=MenuItem)
async def create_menu_item(data: MenuItemCreate, admin: dict = Depends(get_current_admin)):
    item = MenuItem(**data.model_dump())
    await db.menu_items.insert_one(item.model_dump())
    return item

@api_router.put("/menu-items/{item_id}", response_model=MenuItem)
async def update_menu_item(item_id: str, data: MenuItemCreate, admin: dict = Depends(get_current_admin)):
    update_data = data.model_dump()
    
    result = await db.menu_items.update_one(
        {"id": item_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    item = await db.menu_items.find_one({"id": item_id}, {"_id": 0})
    return item

@api_router.delete("/menu-items/{item_id}")
async def delete_menu_item(item_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.menu_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"message": "Menu item deleted"}

# --- GALLERY ROUTES ---

@api_router.get("/gallery", response_model=List[GalleryImage])
async def get_gallery_images():
    images = await db.gallery.find({}, {"_id": 0}).sort("sort_order", 1).to_list(100)
    return images

@api_router.get("/gallery/{category}", response_model=List[GalleryImage])
async def get_gallery_by_category(category: str):
    images = await db.gallery.find({"category": category}, {"_id": 0}).sort("sort_order", 1).to_list(50)
    return images

@api_router.post("/gallery", response_model=GalleryImage)
async def create_gallery_image(data: GalleryImageCreate, admin: dict = Depends(get_current_admin)):
    image = GalleryImage(**data.model_dump())
    await db.gallery.insert_one(image.model_dump())
    return image

@api_router.put("/gallery/{image_id}", response_model=GalleryImage)
async def update_gallery_image(image_id: str, data: GalleryImageCreate, admin: dict = Depends(get_current_admin)):
    update_data = data.model_dump()
    
    result = await db.gallery.update_one(
        {"id": image_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Gallery image not found")
    
    image = await db.gallery.find_one({"id": image_id}, {"_id": 0})
    return image

@api_router.delete("/gallery/{image_id}")
async def delete_gallery_image(image_id: str, admin: dict = Depends(get_current_admin)):
    result = await db.gallery.delete_one({"id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Gallery image not found")
    return {"message": "Gallery image deleted"}

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

# --- IMAGE UPLOAD ROUTES ---

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@api_router.post("/upload")
async def upload_image(file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOADS_DIR / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
    
    # Return the URL
    return {
        "filename": unique_filename,
        "url": f"/api/uploads/{unique_filename}"
    }

@api_router.delete("/upload/{filename}")
async def delete_image(filename: str, admin: dict = Depends(get_current_admin)):
    file_path = UPLOADS_DIR / filename
    if file_path.exists():
        file_path.unlink()
        return {"message": "File deleted"}
    raise HTTPException(status_code=404, detail="File not found")

# --- ROOT ROUTE ---

@api_router.get("/")
async def root():
    return {"message": "BÉNI Restaurant API", "status": "online"}

# Include the router in the main app
app.include_router(api_router)

# Mount uploads directory for serving static files
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

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

@app.on_event("startup")
async def startup_event():
    # Create default admin if not exists
    existing_admin = await db.admins.find_one({"email": "admin"}, {"_id": 0})
    if not existing_admin:
        admin_doc = {
            "id": str(uuid.uuid4()),
            "email": "admin",
            "password": hash_password("#Sti93qn06301616"),
            "name": "Administrateur",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.admins.insert_one(admin_doc)
        print("Default admin created: admin / #Sti93qn06301616")
    
    # Create default gallery images if gallery is empty
    gallery_count = await db.gallery.count_documents({})
    if gallery_count == 0:
        default_images = [
            # Ambiance
            {"url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", "category": "ambiance", "alt_fr": "Intérieur du restaurant", "alt_en": "Restaurant interior", "alt_pt": "Interior do restaurante", "sort_order": 0},
            {"url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80", "category": "ambiance", "alt_fr": "Salle à manger", "alt_en": "Dining area", "alt_pt": "Área de refeições", "sort_order": 1},
            {"url": "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80", "category": "ambiance", "alt_fr": "Bar", "alt_en": "Bar area", "alt_pt": "Área do bar", "sort_order": 2},
            {"url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80", "category": "ambiance", "alt_fr": "Ambiance soirée", "alt_en": "Evening ambiance", "alt_pt": "Ambiente noturno", "sort_order": 3},
            {"url": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80", "category": "ambiance", "alt_fr": "Terrasse", "alt_en": "Restaurant terrace", "alt_pt": "Terraço do restaurante", "sort_order": 4},
            {"url": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80", "category": "ambiance", "alt_fr": "Cave à vin", "alt_en": "Wine cellar", "alt_pt": "Adega", "sort_order": 5},
            # Dishes
            {"url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", "category": "dishes", "alt_fr": "Plat gastronomique", "alt_en": "Gourmet dish", "alt_pt": "Prato gourmet", "sort_order": 0},
            {"url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", "category": "dishes", "alt_fr": "Repas", "alt_en": "Plated meal", "alt_pt": "Refeição", "sort_order": 1},
            {"url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80", "category": "dishes", "alt_fr": "Côtes de porc", "alt_en": "BBQ ribs", "alt_pt": "Costelas", "sort_order": 2},
            {"url": "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80", "category": "dishes", "alt_fr": "Pâtes", "alt_en": "Pasta dish", "alt_pt": "Massa", "sort_order": 3},
            {"url": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80", "category": "dishes", "alt_fr": "Salade", "alt_en": "Salad bowl", "alt_pt": "Salada", "sort_order": 4},
            {"url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80", "category": "dishes", "alt_fr": "Pizza", "alt_en": "Pizza", "alt_pt": "Pizza", "sort_order": 5},
            {"url": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80", "category": "dishes", "alt_fr": "Crêpes", "alt_en": "Pancakes", "alt_pt": "Panquecas", "sort_order": 6},
            {"url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80", "category": "dishes", "alt_fr": "Bowl healthy", "alt_en": "Healthy bowl", "alt_pt": "Bowl saudável", "sort_order": 7},
            {"url": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80", "category": "dishes", "alt_fr": "Dessert", "alt_en": "Cake dessert", "alt_pt": "Sobremesa", "sort_order": 8},
            # Team
            {"url": "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800&q=80", "category": "team", "alt_fr": "Chef en cuisine", "alt_en": "Chef cooking", "alt_pt": "Chef cozinhando", "sort_order": 0},
            {"url": "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80", "category": "team", "alt_fr": "Équipe cuisine", "alt_en": "Kitchen team", "alt_pt": "Equipe de cozinha", "sort_order": 1},
            {"url": "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=800&q=80", "category": "team", "alt_fr": "Portrait du chef", "alt_en": "Chef portrait", "alt_pt": "Retrato do chef", "sort_order": 2},
            {"url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80", "category": "team", "alt_fr": "En cuisine", "alt_en": "Cooking process", "alt_pt": "Processo de cozinha", "sort_order": 3},
        ]
        for img_data in default_images:
            image = GalleryImage(**img_data)
            await db.gallery.insert_one(image.model_dump())
        print(f"Created {len(default_images)} default gallery images")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
