# Backend - FastAPI with CPM Algorithm

This is the backend API for the Project Management Software with Critical Path Method (CPM) algorithm implementation.

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables
Create a `.env` file:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

### 3. Run Server
```bash
uvicorn main:app --reload
```

Visit http://localhost:8000/docs for API documentation.

## 📦 API Endpoints

### Tasks
- `GET /api/tasks/` - List all tasks
- `POST /api/tasks/` - Create a new task
- `GET /api/tasks/{task_id}` - Get task by ID
- `PATCH /api/tasks/{task_id}` - Update task
- `DELETE /api/tasks/{task_id}` - Delete task

### Dependencies
- `GET /api/dependencies/` - List all dependencies
- `POST /api/dependencies/` - Create a new dependency
- `DELETE /api/dependencies/{dependency_id}` - Delete dependency

### CPM Algorithm
- `POST /api/cpm/calculate` - Calculate critical path

## 🔧 Configuration Files

- `Procfile` - For Railway/Heroku deployment
- `runtime.txt` - Python version specification
- `railway.json` - Railway-specific configuration
- `requirements.txt` - Python dependencies

## 🌐 Deployment

### Railway (Recommended)
```bash
railway login
railway init
railway up
```

### Render
1. Connect GitHub repository
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Fly.io
```bash
fly launch
fly deploy
```

## 🔐 Environment Variables

Required for production:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (usually set automatically)

## 📊 Database Schema

The backend uses PostgreSQL with the following tables:
- `tasks` - Project tasks
- `task_dependencies` - Task relationships

See `supabase/migrations/` for schema details.

## 🧪 Testing

```bash
# Run tests (if available)
pytest

# Test health endpoint
curl http://localhost:8000/health
```

## 🛠️ Tech Stack

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Database (via Supabase)
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## 📝 CPM Algorithm

The Critical Path Method implementation:
1. Calculates earliest start/finish times (forward pass)
2. Calculates latest start/finish times (backward pass)
3. Identifies critical path (tasks with zero slack)
4. Returns critical tasks and total project duration

Located in: `cpm.py`

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check Supabase connection limits
- Ensure database migrations are run

### CORS Errors
- Update `allow_origins` in `main.py`
- Include your frontend URL

### Module Import Errors
- Ensure all dependencies are installed
- Check Python version (3.11 required)

## 📚 Documentation

- FastAPI Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Test locally
4. Submit pull request

## 📄 License

MIT License - See LICENSE file for details
