"""
SQLAlchemy ORM models
Defines Tasks and TaskDependencies tables
"""

from sqlalchemy import Column, Text, Integer, Date, Enum, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
import enum
import uuid

Base = declarative_base()


class TaskStatusEnum(str, enum.Enum):
    """Task status enumeration"""
    not_started = "not_started"
    in_progress = "in_progress"
    done = "done"


class Task(Base):
    """Task model - represents a task in the project"""
    __tablename__ = "tasks"

    # FIX: Use default=uuid.uuid4 to generate UUID client-side if server doesn't
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid. uuid4,
        server_default=func.gen_random_uuid()
    )
    name = Column(Text, nullable=False)
    duration = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(
        Enum(TaskStatusEnum, name="task_status"),
        nullable=False,
        default=TaskStatusEnum.not_started,
    )
    buffer_time = Column(Integer, nullable=False, default=0)
    start_date = Column(Date, nullable=True)
    target_completion_date = Column(Date, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func. now(),
        onupdate=func.now(),
    )

    def __repr__(self):
        return f"<Task(id={self.id}, name={self.name})>"


class TaskDependency(Base):
    """TaskDependency model - represents dependency between tasks"""
    __tablename__ = "task_dependencies"

    # FIX: Use default=uuid.uuid4 for client-side generation
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid. uuid4,
        server_default=func.gen_random_uuid()
    )
    task_id = Column(UUID(as_uuid=True), nullable=False)
    depends_on_task_id = Column(UUID(as_uuid=True), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<TaskDependency(task={self.task_id}, depends_on={self.depends_on_task_id})>"