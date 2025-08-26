from typing import Optional
import os, datetime, jwt

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, EmailStr
from argon2 import PasswordHasher

from models.user import User
from models.todo import Todo
from tortoise.contrib.pydantic import pydantic_model_creator

router = APIRouter()
ph = PasswordHasher()
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-me")

bearer_scheme = HTTPBearer(auto_error=False)

TodoOut = pydantic_model_creator(Todo, name="TodoOut", exclude=("user",))
TodoListOut = pydantic_model_creator(Todo, name="TodoListOut", exclude=("user",))

class SignupPayload(BaseModel):
    name: str = Field(max_length=255, min_length=2)
    email: EmailStr
    password: str = Field(max_length=255, min_length=6)

class LoginPayload(BaseModel):
    email: EmailStr
    password: str = Field(max_length=255, min_length=6)

class TodoIn(BaseModel):
    title: str = Field(max_length=255, min_length=1)
    description: Optional[str] = None
    done: Optional[bool] = False
    reminder_at: Optional[datetime.datetime] = None
    priority: Optional[str] = Field(default=None, max_length=10)
    due_date: Optional[datetime.datetime] = None
    tags: Optional[str] = Field(default=None, max_length=255)

class TodoUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    done: Optional[bool] = None
    reminder_at: Optional[datetime.datetime] = None
    priority: Optional[str] = Field(default=None, max_length=10)
    due_date: Optional[datetime.datetime] = None
    tags: Optional[str] = Field(default=None, max_length=255)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        uid = payload.get("id")
        if not uid:
            raise ValueError("Invalid token")
        user = await User.filter(id=uid).first()
        if not user:
            raise ValueError("User not found")
        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

@router.post("/signup")
async def signup(data: SignupPayload):
    if await User.filter(email=data.email).first():
        raise HTTPException(status_code=400, detail="You are already registered. Please login.")
    user = await User.create(
        name=data.name,
        email=data.email,
        password=ph.hash(data.password),
    )
    return {"success": True, "detail": "Your account is successfully registered.", "user_id": user.id}

@router.post("/login")
async def login(data: LoginPayload):
    user = await User.filter(email=data.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    try:
        ph.verify(user.password, data.password)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid email or password.")

    token = jwt.encode(
        {"id": user.id, "iat": int(datetime.datetime.utcnow().timestamp())},
        JWT_SECRET,
        algorithm="HS256",
    )
    return {"success": True, "token": token}

@router.post("/todos", summary="Create a todo", response_model=TodoOut)
async def create_todo(payload: TodoIn, user: User = Depends(get_current_user)):
    todo = await Todo.create(
        title=payload.title,
        description=payload.description,
        done=bool(payload.done),
        reminder_at=payload.reminder_at,
        priority=payload.priority,
        due_date=payload.due_date,
        tags=payload.tags,
        user=user,
    )
    return await TodoOut.from_tortoise_orm(todo)


@router.get("/todos", summary="List my todos")
async def list_todos(user: User = Depends(get_current_user)):
    qs = Todo.filter(user_id=user.id).order_by("-created_at")
    return await TodoOut.from_queryset(qs)

@router.get("/todos/{todo_id}", summary="Get a todo", response_model=TodoOut)
async def get_todo(todo_id: int, user: User = Depends(get_current_user)):
    todo = await Todo.filter(id=todo_id, user_id=user.id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return await TodoOut.from_tortoise_orm(todo)
# return await _serialize(todo) by rehmnan by 

@router.put("/todos/{todo_id}", summary="Replace a todo", response_model=TodoOut)
async def replace_todo(todo_id: int, payload: TodoIn, user: User = Depends(get_current_user)):
    todo = await Todo.filter(id=todo_id, user_id=user.id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    todo.title = payload.title
    todo.description = payload.description
    todo.done = bool(payload.done)
    todo.reminder_at = payload.reminder_at
    todo.priority = payload.priority
    todo.due_date = payload.due_date
    todo.tags = payload.tags
    await todo.save()
    return await TodoOut.from_tortoise_orm(todo)



@router.patch("/todos/{todo_id}", summary="Update a todo", response_model=TodoOut)
async def update_todo(todo_id: int, payload: TodoUpdate, user: User = Depends(get_current_user)):
    todo = await Todo.filter(id=todo_id, user_id=user.id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    if payload.title is not None:
        todo.title = payload.title
    if payload.description is not None:
        todo.description = payload.description
    if payload.done is not None:
        todo.done = bool(payload.done)
    if payload.reminder_at is not None:
        todo.reminder_at = payload.reminder_at
    if payload.priority is not None:
        todo.priority = payload.priority
    if payload.due_date is not None:
        todo.due_date = payload.due_date
    if payload.tags is not None:
        todo.tags = payload.tags
    await todo.save()
    return await TodoOut.from_tortoise_orm(todo)


@router.delete("/todos/{todo_id}", summary="Delete a todo")
async def delete_todo(todo_id: int, user: User = Depends(get_current_user)):
    deleted = await Todo.filter(id=todo_id, user_id=user.id).delete()
    if not deleted:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"success": True}
