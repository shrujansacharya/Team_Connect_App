from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import razorpay
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import calendar

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env', override=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Razorpay Client
rzp_client = razorpay.Client(auth=(
    os.environ.get("RAZORPAY_KEY_ID", "rzp_test_placeholder"),
    os.environ.get("RAZORPAY_KEY_SECRET", "placeholder_secret")
))

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "shrujan@2004")

# Models
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AdminLogin(BaseModel):
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    email: str
    phone: str
    is_approved: bool = False
    role: str = "user"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class MonthlyPayment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    month: int
    year: int
    amount: float = 100.0
    status: str = "pending" # pending, success, failed
    payment_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    transaction_id: Optional[str] = None
    method: Optional[str] = "UPI"
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None

class Festival(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    start_date: datetime
    end_date: datetime
    total_budget: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Expense(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    festival_id: str
    name: str
    amount: float
    date: datetime
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Slogan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    is_active: bool = True
    order: int = 0

class Achievement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    date: datetime
    image_url: Optional[str] = None

class ExpenseCreate(BaseModel):
    festival_id: str
    name: str
    amount: float
    date: datetime

class FestivalCreate(BaseModel):
    name: str
    description: str
    start_date: datetime
    end_date: datetime
    total_budget: float

class SloganCreate(BaseModel):
    text: str
    order: int = 0

class AchievementCreate(BaseModel):
    title: str
    description: str
    date: datetime
    image_url: Optional[str] = None

# Helper functions
def hash_password(password: str) -> str:
    if len(password.encode('utf-8')) > 72:
        raise HTTPException(status_code=400, detail="Password is too long (max 72 bytes)")
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    if role == "admin":
        return {"id": "admin", "role": "admin", "full_name": "Admin"}
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_current_approved_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") == "admin":
        return current_user
    if not current_user.get("is_approved"):
        raise HTTPException(status_code=403, detail="Your account is pending approval")
    return current_user

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Auth routes
@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    # Check if email exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if phone exists
    existing_phone = await db.users.find_one({"phone": user_data.phone}, {"_id": 0})
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    hashed_password = hash_password(user_data.password)
    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        phone=user_data.phone,
        is_approved=False,
        role="user"
    )
    
    user_dict = user.model_dump()
    user_dict["password"] = hashed_password
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    return user

@api_router.post("/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(
        data={"sub": user["id"], "role": user["role"]}
    )
    
    # Convert ISO string back to datetime
    if isinstance(user["created_at"], str):
        user["created_at"] = datetime.fromisoformat(user["created_at"])
    
    user_obj = User(**{k: v for k, v in user.items() if k != "password"})
    
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

@api_router.post("/auth/admin-login", response_model=Token)
async def admin_login(login_data: AdminLogin):
    if login_data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin password")
    
    access_token = create_access_token(
        data={"sub": "admin", "role": "admin"}
    )
    
    admin_user = User(
        id="admin",
        full_name="Admin",
        email="admin@balaga.com",
        phone="",
        is_approved=True,
        role="admin"
    )
    
    return Token(access_token=access_token, token_type="bearer", user=admin_user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    if isinstance(current_user["created_at"], str):
        current_user["created_at"] = datetime.fromisoformat(current_user["created_at"])
    return User(**current_user)

# User management routes (Admin only)
@api_router.get("/users", response_model=List[User])
async def get_users(current_user: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    for user in users:
        if isinstance(user["created_at"], str):
            user["created_at"] = datetime.fromisoformat(user["created_at"])
    return users

@api_router.put("/users/{user_id}/approve")
async def approve_user(user_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_approved": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User approved successfully"}

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# Members routes
@api_router.get("/members")
async def get_members(current_user: dict = Depends(get_current_approved_user)):
    now = datetime.now(timezone.utc)
    current_month = now.month
    current_year = now.year

    members = await db.users.find(
        {"is_approved": True, "role": "user"},
        {"_id": 0, "password": 0}
    ).to_list(1000)

    # Get all payments for current month to optimize
    payments = await db.monthly_payments.find(
        {"month": current_month, "year": current_year, "status": "success"},
        {"user_id": 1, "_id": 0}
    ).to_list(1000)
    paid_user_ids = {p["user_id"] for p in payments}

    for member in members:
        if isinstance(member["created_at"], str):
            member["created_at"] = datetime.fromisoformat(member["created_at"])
        member["has_paid_current_month"] = member["id"] in paid_user_ids
    return members

# Monthly savings routes
@api_router.get("/savings/current")
async def get_current_month_savings(current_user: dict = Depends(get_current_approved_user)):
    now = datetime.now(timezone.utc)
    current_month = now.month
    current_year = now.year
    
    # Check for successful payment this month
    payment = await db.monthly_payments.find_one(
        {
            "user_id": current_user["id"],
            "month": current_month,
            "year": current_year,
            "status": "success"
        },
        {"_id": 0}
    )
    
    month_name = calendar.month_name[current_month]
    return {
        "month": current_month,
        "year": current_year,
        "month_name": month_name,
        "has_paid": payment is not None,
        "payment": payment
    }

class OrderCreate(BaseModel):
    amount: int

@api_router.post("/savings/create-order")
async def create_razorpay_order(data: OrderCreate, current_user: dict = Depends(get_current_approved_user)):
    try:
        order = rzp_client.order.create({
            'amount': data.amount * 100,
            'currency': 'INR',
            'payment_capture': 1
        })
        now = datetime.now(timezone.utc)
        payment = MonthlyPayment(
            user_id=current_user["id"],
            month=now.month,
            year=now.year,
            amount=data.amount,
            status="pending",
            razorpay_order_id=order['id']
        )
        await db.monthly_payments.insert_one(payment.model_dump())
        return order
    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail="Payment gateway error")

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@api_router.post("/savings/verify-payment")
async def verify_payment(data: PaymentVerify, current_user: dict = Depends(get_current_approved_user)):
    try:
        rzp_client.utility.verify_payment_signature(data.model_dump())
        await db.monthly_payments.update_one(
            {"razorpay_order_id": data.razorpay_order_id},
            {
                "$set": {
                    "status": "success",
                    "razorpay_payment_id": data.razorpay_payment_id,
                    "razorpay_signature": data.razorpay_signature,
                    "transaction_id": data.razorpay_payment_id,
                    "payment_date": datetime.now(timezone.utc)
                }
            }
        )
        return {"status": "success"}
    except Exception as e:
        await db.monthly_payments.update_one(
            {"razorpay_order_id": data.razorpay_order_id},
            {"$set": {"status": "failed"}}
        )
        raise HTTPException(status_code=400, detail="Payment verification failed")

@api_router.get("/savings/analytics")
async def get_savings_analytics(current_user: dict = Depends(get_admin_user)):
    now = datetime.now(timezone.utc)
    current_month = now.month
    current_year = now.year
    
    # Get total approved members
    total_members = await db.users.count_documents({"is_approved": True, "role": "user"})
    
    # Get payments for current month (success only)
    payments = await db.monthly_payments.count_documents(
        {"month": current_month, "year": current_year, "status": "success"}
    )
    
    # Get total collected this month (success only)
    pipeline = [
        {"$match": {"month": current_month, "year": current_year, "status": "success"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    result = await db.monthly_payments.aggregate(pipeline).to_list(1)
    total_collected = result[0]["total"] if result else 0
    
    # Get total collected this year (success only)
    pipeline_year = [
        {"$match": {"year": current_year, "status": "success"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    result_year = await db.monthly_payments.aggregate(pipeline_year).to_list(1)
    total_year = result_year[0]["total"] if result_year else 0
    
    return {
        "total_members": total_members,
        "paid_count": payments,
        "unpaid_count": total_members - payments,
        "total_collected_this_month": total_collected,
        "total_collected_this_year": total_year,
        "month_name": calendar.month_name[current_month]
    }

@api_router.get("/savings/members-status")
async def get_members_payment_status(current_user: dict = Depends(get_admin_user)):
    now = datetime.now(timezone.utc)
    current_month = now.month
    current_year = now.year
    
    # Get all approved members
    members = await db.users.find(
        {"is_approved": True, "role": "user"},
        {"_id": 0, "password": 0}
    ).to_list(1000)
    
    # Get payments for current month
    payments = await db.monthly_payments.find(
        {"month": current_month, "year": current_year},
        {"_id": 0}
    ).to_list(1000)
    
    payment_map = {p["user_id"]: p for p in payments}
    
    result = []
    for member in members:
        payment = payment_map.get(member["id"])
        result.append({
            "user": member,
            "has_paid": payment is not None,
            "payment": payment
        })
    
    return result

# Festival routes
@api_router.post("/festivals", response_model=Festival)
async def create_festival(festival_data: FestivalCreate, current_user: dict = Depends(get_admin_user)):
    festival = Festival(**festival_data.model_dump())
    festival_dict = festival.model_dump()
    festival_dict["start_date"] = festival_dict["start_date"].isoformat()
    festival_dict["end_date"] = festival_dict["end_date"].isoformat()
    festival_dict["created_at"] = festival_dict["created_at"].isoformat()
    
    await db.festivals.insert_one(festival_dict)
    return festival

@api_router.get("/festivals", response_model=List[Festival])
async def get_festivals(current_user: dict = Depends(get_current_approved_user)):
    festivals = await db.festivals.find({}, {"_id": 0}).to_list(1000)
    for festival in festivals:
        if isinstance(festival["start_date"], str):
            festival["start_date"] = datetime.fromisoformat(festival["start_date"])
        if isinstance(festival["end_date"], str):
            festival["end_date"] = datetime.fromisoformat(festival["end_date"])
        if isinstance(festival["created_at"], str):
            festival["created_at"] = datetime.fromisoformat(festival["created_at"])
    return festivals

@api_router.get("/festivals/{festival_id}", response_model=Festival)
async def get_festival(festival_id: str, current_user: dict = Depends(get_current_approved_user)):
    festival = await db.festivals.find_one({"id": festival_id}, {"_id": 0})
    if not festival:
        raise HTTPException(status_code=404, detail="Festival not found")
    
    if isinstance(festival["start_date"], str):
        festival["start_date"] = datetime.fromisoformat(festival["start_date"])
    if isinstance(festival["end_date"], str):
        festival["end_date"] = datetime.fromisoformat(festival["end_date"])
    if isinstance(festival["created_at"], str):
        festival["created_at"] = datetime.fromisoformat(festival["created_at"])
    
    return Festival(**festival)



@api_router.delete("/festivals/{festival_id}")
async def delete_festival(festival_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.festivals.delete_one({"id": festival_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Festival not found")
    # Also delete associated expenses
    await db.expenses.delete_many({"festival_id": festival_id})
    return {"message": "Festival deleted successfully"}

# Expense routes
@api_router.post("/expenses", response_model=Expense)
async def create_expense(expense_data: ExpenseCreate, current_user: dict = Depends(get_admin_user)):
    expense = Expense(**expense_data.model_dump(), created_by=current_user["id"])
    expense_dict = expense.model_dump()
    expense_dict["date"] = expense_dict["date"].isoformat()
    expense_dict["created_at"] = expense_dict["created_at"].isoformat()
    
    await db.expenses.insert_one(expense_dict)
    return expense

@api_router.get("/festivals/{festival_id}/expenses", response_model=List[Expense])
async def get_festival_expenses(festival_id: str, current_user: dict = Depends(get_current_approved_user)):
    expenses = await db.expenses.find({"festival_id": festival_id}, {"_id": 0}).to_list(1000)
    for expense in expenses:
        if isinstance(expense["date"], str):
            expense["date"] = datetime.fromisoformat(expense["date"])
        if isinstance(expense["created_at"], str):
            expense["created_at"] = datetime.fromisoformat(expense["created_at"])
    return expenses

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.expenses.delete_one({"id": expense_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted successfully"}

# Home content routes

# Models for Landing Page
class TeamMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str
    image_url: Optional[str] = None
    order: int = 0

class TeamMemberCreate(BaseModel):
    name: str
    role: str
    image_url: Optional[str] = None
    order: int = 0

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    icon_name: str

class ServiceCreate(BaseModel):
    title: str
    description: str
    icon_name: str

class SiteConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "config"
    logo_url: Optional[str] = None
    hero_image_url: Optional[str] = None
    banner_url: Optional[str] = None
    tagline: Optional[str] = None
    about_title: Optional[str] = "About Us"
    about_description: Optional[str] = None
    member_count_override: Optional[int] = None
    years_experience: int = 0
    contact_email: Optional[str] = None
    upi_id: Optional[str] = "example@upi"
    merchant_name: Optional[str] = "Jai Shree Ram Geleyara Balaga"
    razorpay_key_id: Optional[str] = None

# Slogans
@api_router.post("/slogans", response_model=Slogan)
async def create_slogan(slogan_data: SloganCreate, current_user: dict = Depends(get_admin_user)):
    slogan = Slogan(**slogan_data.model_dump())
    slogan_dict = slogan.model_dump()
    await db.slogans.insert_one(slogan_dict)
    return slogan

@api_router.get("/slogans", response_model=List[Slogan])
async def get_slogans():
    slogans = await db.slogans.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(1000)
    return slogans

@api_router.delete("/slogans/{slogan_id}")
async def delete_slogan(slogan_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.slogans.delete_one({"id": slogan_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Slogan not found")
    return {"message": "Slogan deleted successfully"}

# Achievements
@api_router.post("/achievements", response_model=Achievement)
async def create_achievement(achievement_data: AchievementCreate, current_user: dict = Depends(get_admin_user)):
    achievement = Achievement(**achievement_data.model_dump())
    achievement_dict = achievement.model_dump()
    achievement_dict["date"] = achievement_dict["date"].isoformat()
    await db.achievements.insert_one(achievement_dict)
    return achievement

@api_router.get("/achievements", response_model=List[Achievement])
async def get_achievements():
    achievements = await db.achievements.find({}, {"_id": 0}).sort("date", -1).to_list(1000)
    for achievement in achievements:
        if isinstance(achievement["date"], str):
            achievement["date"] = datetime.fromisoformat(achievement["date"])
    return achievements

@api_router.delete("/achievements/{achievement_id}")
async def delete_achievement(achievement_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.achievements.delete_one({"id": achievement_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Achievement not found")
    return {"message": "Achievement deleted successfully"}

# Site Configuration Routes
@api_router.get("/landing/config", response_model=SiteConfig)
async def get_site_config():
    config = await db.site_config.find_one({"id": "config"}, {"_id": 0})
    if not config:
        config = SiteConfig().model_dump()
    
    # Use environment variables as fallback for sensitive keys
    if not config.get("razorpay_key_id"):
        config["razorpay_key_id"] = os.environ.get("RAZORPAY_KEY_ID")
        
    return SiteConfig(**config)

@api_router.put("/landing/config", response_model=SiteConfig)
async def update_site_config(config_data: SiteConfig, current_user: dict = Depends(get_admin_user)):
    config_dict = config_data.model_dump()
    config_dict["id"] = "config"
    await db.site_config.update_one(
        {"id": "config"},
        {"$set": config_dict},
        upsert=True
    )
    return config_data

# Team Member Routes
@api_router.get("/landing/team", response_model=List[TeamMember])
async def get_team_members():
    members = await db.team_members.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    return members

@api_router.post("/landing/team", response_model=TeamMember)
async def create_team_member(member_data: TeamMemberCreate, current_user: dict = Depends(get_admin_user)):
    member = TeamMember(**member_data.model_dump())
    await db.team_members.insert_one(member.model_dump())
    return member

@api_router.delete("/landing/team/{member_id}")
async def delete_team_member(member_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.team_members.delete_one({"id": member_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
    return {"message": "Team member deleted"}

# Service Routes
@api_router.get("/landing/services", response_model=List[Service])
async def get_services():
    services = await db.services.find({}, {"_id": 0}).to_list(1000)
    return services

@api_router.post("/landing/services", response_model=Service)
async def create_service(service_data: ServiceCreate, current_user: dict = Depends(get_admin_user)):
    service = Service(**service_data.model_dump())
    await db.services.insert_one(service.model_dump())
    return service

@api_router.delete("/landing/services/{service_id}")
async def delete_service(service_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.services.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        logger.info(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Request failed: {str(e)}")
        raise e

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    # In production, reload should be False
    is_dev = os.environ.get("DEV_MODE", "true").lower() == "true"
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=is_dev)