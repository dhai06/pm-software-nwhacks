from fastapi import FastAPI
from routes import tasks

app = FastAPI()

# app.include_router(projects.router)
app.include_router(tasks.router)

@app.get("/")
def root():
    return {"status": "Backend running"}
