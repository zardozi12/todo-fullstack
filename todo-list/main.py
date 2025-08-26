import os
from dotenv import load_dotenv
from fastapi import FastAPI
from tortoise import Tortoise
from fastapi.middleware.cors import CORSMiddleware
from controllers import user_controller
from argon2 import PasswordHasher

load_dotenv()
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite://db.sqlite3")

async def lifespan(_: FastAPI):
    await Tortoise.init(
        db_url=DATABASE_URL,
        modules={"models": ["models.user", "models.todo"]},
    )
    await Tortoise.generate_schemas()
    yield
    await Tortoise.close_connections()

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_controller.router)