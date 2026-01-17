from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID, primary_key=True)
    project_id = Column(UUID, ForeignKey("projects.id"))
    name = Column(String)
    duration = Column(Integer)
    completed = Column(Boolean)

    earliest_start = Column(Integer)
    earliest_finish = Column(Integer)
    latest_start = Column(Integer)
    latest_finish = Column(Integer)
    slack = Column(Integer)
