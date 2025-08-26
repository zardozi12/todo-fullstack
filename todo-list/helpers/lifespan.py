import os
from fastapi import FastAPI
from tortoise import Tortoise
from dotenv import load_dotenv



load_dotenv()

TORTOISE_CONFIG={
    "connections": {
        "default":os.getenv("DATABASE_URL",os.environ.get("DATABASE_URL"))
    },
    "apps": {
        "models": {
            "models": ["models.user"],
        }
    }
}

async def lifespan(_):
    await Tortoise.init(config=TORTOISE_CONFIG)
    yield

# DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:3660@localhost:5432/immediate")



# async def lifespan(_: FastAPI):
#     await Tortoise.init(
#         db_url=DATABASE_URL,
#         modules={"models": ["models.user"]},  
#     )
#     await Tortoise.generate_schemas()
#     yield
#     await Tortoise.close_connections()
