"""
Debug script to test database connection and imports
Run this FIRST before trying to use the API
"""

import sys
import traceback

print("\n" + "="*70)
print("🔍 BACKEND CONNECTION & IMPORT DEBUG SCRIPT")
print("="*70 + "\n")

# Test 1: Config Loading
print("TEST 1: Loading configuration...")
try:
    from config import DATABASE_URL, API_PORT, API_HOST, ENVIRONMENT
    print(f"  ✅ Config loaded successfully")
    print(f"     - DATABASE_URL: {DATABASE_URL[: 50]}...")
    print(f"     - API_PORT: {API_PORT}")
    print(f"     - ENVIRONMENT: {ENVIRONMENT}")
except Exception as e:
    print(f"  ❌ FAILED to load config")
    print(f"     Error: {str(e)}")
    traceback.print_exc()
    sys.exit(1)

# Test 2: Database Engine
print("\nTEST 2: Creating database engine...")
try:
    from database import engine
    print(f"  ✅ Database engine created")
    print(f"     - Engine:  {engine}")
except Exception as e:
    print(f"  ❌ FAILED to create engine")
    print(f"     Error: {str(e)}")
    traceback.print_exc()
    sys.exit(1)

# Test 3: Models
print("\nTEST 3: Loading SQLAlchemy models...")
try:
    from models import Task, TaskDependency, TaskStatusEnum, Base
    print(f"  ✅ Models loaded successfully")
    print(f"     - Task table:  {Task.__tablename__}")
    print(f"     - TaskDependency table: {TaskDependency.__tablename__}")
    print(f"     - Status enum values: {[e.value for e in TaskStatusEnum]}")
except Exception as e:
    print(f"  ❌ FAILED to load models")
    print(f"     Error: {str(e)}")
    traceback.print_exc()
    sys.exit(1)

# Test 4: Schemas
print("\nTEST 4: Loading Pydantic schemas...")
try:
    from schemas import TaskCreate, TaskOut, TaskUpdate, DependencyCreate, DependencyOut
    print(f"  ✅ Schemas loaded successfully")
    print(f"     - TaskCreate")
    print(f"     - TaskOut")
    print(f"     - DependencyCreate")
    print(f"     - DependencyOut")
except Exception as e: 
    print(f"  ❌ FAILED to load schemas")
    print(f"     Error: {str(e)}")
    traceback.print_exc()
    sys.exit(1)

# Test 5: CRUD Functions
print("\nTEST 5: Loading CRUD functions...")
try:
    from crud import (
        get_task,
        list_tasks,
        create_task,
        get_dependency,
        list_dependencies,
    )
    print(f"  ✅ CRUD functions loaded successfully")
except Exception as e:
    print(f"  ❌ FAILED to load CRUD functions")
    print(f"     Error:  {str(e)}")
    traceback.print_exc()
    sys.exit(1)

# Test 6: Routers
print("\nTEST 6: Loading routers...")
try:
    from routers import tasks, dependencies, cpm_route
    print(f"  ✅ Routers loaded successfully")
    print(f"     - tasks. router: {tasks.router. prefix}")
    print(f"     - dependencies.router: {dependencies. router.prefix}")
    print(f"     - cpm_route.router: {cpm_route.router.prefix}")
except Exception as e:
    print(f"  ❌ FAILED to load routers")
    print(f"     Error: {str(e)}")
    traceback.print_exc()
    sys.exit(1)

# Test 7: FastAPI App
print("\nTEST 7: Creating FastAPI app...")
try:
    from main import app
    print(f"  ✅ FastAPI app created successfully")
    print(f"     - App title: {app.title}")
    print(f"     - Number of routes: {len(app. routes)}")
    print(f"\n     Registered routes:")
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            print(f"        - {' ,'.join(route.methods)} {route.path}")
        else:
            print(f"        - {route. path}")
except Exception as e: 
    print(f"  ❌ FAILED to create FastAPI app")
    print(f"     Error: {str(e)}")
    traceback.print_exc()
    sys.exit(1)

# Test 8: Database Connection
print("\nTEST 8: Testing database connection...")
try:
    from sqlalchemy import text
    from database import SessionLocal
    
    db = SessionLocal()
    result = db.execute(text("SELECT 1"))
    db.close()
    print(f"  ✅ Database connection successful")
except Exception as e:
    print(f"  ❌ FAILED to connect to database")
    print(f"     Error: {str(e)}")
    traceback.print_exc()
    sys.exit(1)

# Test 9: Query Tasks Table
print("\nTEST 9: Querying tasks table...")
try:
    from database import SessionLocal
    from sqlalchemy import text
    
    db = SessionLocal()
    result = db.execute(text("SELECT COUNT(*) as count FROM tasks"))
    row = result.  fetchone()
    count = row[0] if row else 0
    db.close()
    print(f"  ✅ Tasks table query successful")
    print(f"     - Total tasks in database: {count}")
except Exception as e:
    print(f"  ❌ FAILED to query tasks table")
    print(f"     Error: {str(e)}")
    traceback.print_exc()
    sys.exit(1)

# Test 10: Query Dependencies Table
print("\nTEST 10: Querying task_dependencies table...")
try:
    from database import SessionLocal
    from sqlalchemy import text
    
    db = SessionLocal()
    result = db.execute(text("SELECT COUNT(*) as count FROM task_dependencies"))
    row = result.fetchone()
    count = row[0] if row else 0
    db.close()
    print(f"  ✅ Task dependencies table query successful")
    print(f"     - Total dependencies in database: {count}")
except Exception as e:
    print(f"  ❌ FAILED to query task_dependencies table")
    print(f"     Error:  {str(e)}")
    traceback.print_exc()
    sys.exit(1)

print("\n" + "="*70)
print("✅ ALL TESTS PASSED!")
print("="*70)
print("\nYour backend is properly configured and ready to use.")
print("Start the server with:   uvicorn main:app --reload --port 8000\n")