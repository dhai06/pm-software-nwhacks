"""
Seed script for Cafe Opening project data.
Replaces all existing data with the new cafe opening project dataset.

Run from Backend/ directory:
    python seed_cafe_data.py
"""

from datetime import date

# Handle imports for running from Backend/ directory
try:
    from backend.database import SessionLocal
    from backend.models import Task, TaskDependency, TaskStatusEnum
except ImportError:
    from database import SessionLocal
    from models import Task, TaskDependency, TaskStatusEnum


def seed_cafe_data():
    """Seed the database with Cafe Opening project data."""
    db = SessionLocal()

    try:
        # 1. Delete existing records (dependencies first due to foreign key constraints)
        print("Deleting existing task dependencies...")
        db.query(TaskDependency).delete()

        print("Deleting existing tasks...")
        db.query(Task).delete()

        # 2. Define tasks data
        tasks_data = [
            {"key": "t1", "name": "Develop Business Plan", "duration": 10},
            {"key": "t2", "name": "Secure Funding", "duration": 30},
            {"key": "t3", "name": "Scout Real Estate", "duration": 14},
            {"key": "t4", "name": "Lease Negotiation", "duration": 14},
            {"key": "t5", "name": "Apply for Permits", "duration": 60},
            {"key": "t6", "name": "Interior Design", "duration": 21},
            {"key": "t7", "name": "Renovations", "duration": 45},
            {"key": "t8", "name": "Order Equipment", "duration": 30},
            {"key": "t9", "name": "Menu Finalization", "duration": 14},
            {"key": "t10", "name": "Hire Staff", "duration": 21},
            {"key": "t11", "name": "Install Equipment", "duration": 5},
            {"key": "t12", "name": "Staff Training", "duration": 10},
            {"key": "t13", "name": "Health Inspection", "duration": 5},
            {"key": "t14", "name": "Soft Opening", "duration": 3},
            {"key": "t15", "name": "Grand Opening", "duration": 1},
        ]

        # 3. Create Task objects
        print("Creating tasks...")
        today = date.today()
        task_map = {}  # Maps key (t1, t2, etc.) to Task object

        for task_data in tasks_data:
            task = Task(
                name=task_data["name"],
                duration=task_data["duration"],
                status=TaskStatusEnum.not_started,
                start_date=today,
            )
            db.add(task)
            task_map[task_data["key"]] = task

        # 4. Flush to generate UUIDs
        print("Flushing to generate UUIDs...")
        db.flush()

        # 5. Define dependencies (depends_on -> task that depends on it)
        # Format: (dependency_key, dependent_task_key)
        # dependency_key = depends_on_task_id, dependent_task_key = task_id
        dependencies_data = [
            ("t1", "t2"),   # t1 -> t2 means t2 depends on t1
            ("t2", "t3"),
            ("t3", "t4"),
            ("t4", "t5"),
            ("t4", "t6"),
            ("t4", "t8"),
            ("t5", "t7"),
            ("t6", "t7"),
            ("t1", "t9"),
            ("t2", "t10"),
            ("t7", "t11"),
            ("t8", "t11"),
            ("t10", "t12"),
            ("t11", "t12"),
            ("t11", "t13"),
            ("t12", "t14"),
            ("t13", "t14"),
            ("t14", "t15"),
        ]

        # 6. Create TaskDependency objects
        print("Creating task dependencies...")
        for depends_on_key, task_key in dependencies_data:
            dependency = TaskDependency(
                task_id=task_map[task_key].id,
                depends_on_task_id=task_map[depends_on_key].id,
            )
            db.add(dependency)

        # 7. Commit the transaction
        print("Committing transaction...")
        db.commit()

        print(f"Successfully seeded {len(tasks_data)} tasks and {len(dependencies_data)} dependencies.")
        print("\nTasks created:")
        for key, task in task_map.items():
            print(f"  {key}: {task.name} (ID: {task.id})")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_cafe_data()
