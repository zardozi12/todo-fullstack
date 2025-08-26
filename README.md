# Full-Stack Todo App (FastAPI + Tortoise ORM + React/Vite)

A simple full-stack Todo application with authentication.

## Stack
- Backend: FastAPI, Tortoise ORM, SQLite/PostgreSQL, Argon2, JWT
- Frontend: React + Vite, Axios, React Router

## Structure
```
./
├─ todo-list/                 # Backend
│  ├─ controllers/
│  ├─ helpers/
│  ├─ models/
│  │  ├─ user.py              # User model
│  │  └─ todo.py              # Todo model
│  ├─ main.py
│  ├─ requirements.txt
│  └─ tortoise_config.py
└─ vite-project/              # Frontend
   ├─ src/
   │  ├─ api/axios.jsx
   │  ├─ components/
   │  ├─ context/
   │  ├─ App.jsx
   │  └─ main.jsx
   └─ package.json
```

## Backend setup (Windows PowerShell)
```powershell
cd "C:\Users\AbdulRehman\Desktop\todo-list (1)\todo-list"
python -m venv ..\venv
..\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Database
- SQLite (default): no config needed
- PostgreSQL (recommended):
```powershell
'DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/immediate' | Out-File -Encoding ASCII .env
```
Note: Use `postgres://` scheme (not `postgresql://`).

### Run API
```powershell
..\venv\Scripts\python -m uvicorn main:app --host 127.0.0.1 --port 8999 --reload
```
Docs: http://127.0.0.1:8999/docs

### API summary
- POST `/signup` → { success, user_id }
- POST `/login` → { token }
- GET/POST `/todos`
- GET/PUT/PATCH/DELETE `/todos/{id}`
Auth: send `Authorization: Bearer <token>`.

### Migrations (optional, Aerich)
```powershell
..\venv\Scripts\aerich init -t tortoise_config.TORTOISE_ORM
..\venv\Scripts\aerich init-db
# when models change
..\venv\Scripts\aerich migrate --name change
..\venv\Scripts\aerich upgrade
```

## Frontend setup
```powershell
cd "C:\Users\AbdulRehman\Desktop\todo-list (1)\vite-project"
Set-Content -Path .env -Value "VITE_API_URL=http://127.0.0.1:8999"
npm install
npm run dev
# open http://localhost:5173
```
Build: `npm run build`, preview: `npm run preview`

## Features
- Auth (signup/login), token in localStorage
- Todos: add, edit inline, delete, complete/undo
- Reminders: set/clear, badge display
- Search and filters (All/Active/Completed)
- React Router: `/login`, `/`

## Quick test (PowerShell)
```powershell
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8999/signup" -ContentType "application/json" -Body '{"name":"Test","email":"user@example.com","password":"secret123"}'
$resp = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8999/login" -ContentType "application/json" -Body '{"email":"user@example.com","password":"secret123"}'
$TOKEN = $resp.token
Invoke-RestMethod -Headers @{Authorization="Bearer $TOKEN"} -Method Post -Uri "http://127.0.0.1:8999/todos" -ContentType "application/json" -Body '{"title":"First","description":"Test"}'
Invoke-RestMethod -Headers @{Authorization="Bearer $TOKEN"} -Method Get -Uri "http://127.0.0.1:8999/todos"
```

## Troubleshooting
- Use `postgres://` scheme (not `postgresql://`).
- Ensure `.env` exists before starting API.
- Set `VITE_API_URL` and restart Vite for frontend API base.
- 401s: re-login to get a fresh token; send Bearer header.

## License
MIT
