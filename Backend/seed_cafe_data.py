"""
Seed script for Cafe Opening project data.
Replaces all existing data with the new cafe opening project dataset.

Run from Backend/ directory:
    python seed_cafe_data.py
"""

from datetime import date, timedelta

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

        # 2. Define tasks data with all task properties
        # Properties: name, duration, description, status, buffer_time, start_date, target_completion_date
        tasks_data = [
            {
                "key": "t1",
                "name": "Develop Business Plan",
                "duration": 10,
                "description": "Create comprehensive business plan including market analysis, financial projections, and operational strategy.",
                "status": TaskStatusEnum.not_started,
                "buffer_time": 2,
            },
            {
                "key": "t2",
                "name": "Secure Funding",
                "duration": 30,
                "description": "Apply for business loans, seek investors, or secure personal financing for the cafe startup costs.",
                "status": TaskStatusEnum.not_started,
                "buffer_time": 5,
            },
            {
                "key": "t3",
                "name": "Scout Real Estate",
                "duration": 14,
                "description": "Research and visit potential locations. Evaluate foot traffic, parking, visibility, and lease terms.",
                "status": TaskStatusEnum.not_started,
                "buffer_time": 3,
            },
            {
                "key": "t4",
                "name": "Lease Negotiation",
                "duration": 14,
                "description": "Negotiate lease terms including rent, duration, renewal options, and tenant improvements.",
                "status": TaskStatusEnum.not_started,
                "buffer_time": 2,
            },
            {
                "key": "t5",
                "name": "Apply for Permits",
                "duration": 60,
                "description": "Submit applications for business license, food service permit, health permit, and signage permits.",
                "status": TaskStatusEnum.not_started,
                "buffer_time": 10,
            },
            {
                "key": "t6",
                "name": "Interior Design",
                "duration": 21,
                "description": "Work with designer to create cafe layout, select furniture, fixtures, color scheme, and ambiance.",
                "status": TaskStatusEnum.not_started,
                "buffer_time": 3,
            },
            {
                "key": "t7",
                "name": "Renovations",
                "duration": 45,
                "description": "Complete all construction and renovation work including plumbing, electrical, flooring, and painting.",
                "status": TaskStatusEnum.not_started,
                "buffer_time": 7,
            },
            {
                "key": "t8",
                "name": "Order Equipment",
                "duration": 30,
                "description": "Purchase espresso machines, refrigeration, ovens, POS system, and all kitchen equipment.",
                "status": TaskStatusEnum.not_started,
                "buffer_time": 5,
            },
            {
                "key": "t9",
                "name": "Menu Finalization",
                "duration": 14,
                "description": "Finalize menu items, recipes, pricing, and source suppliers for ingredients.",
                "status": TaskStatusEnum.not_started,
                "buffer_time": 2,
            },
            {
                "key": "t10",
                "name": "Hire Staff",
                "duration": 21,
                "description": "Recruit and hire baristas, kitchen staff, and front-of-house employees.",
                "status": TaskStatusEnum.not_started,
                "buffer_time": 3,
            },
            {
                "key": "t11",
                "name": "Install Equipment",
                "duration": 5,
                "description": "Set up and install all kitchen and cafe equipment. Test all systems.",
                "status": TaskStatusEnum.not_started,
                "buffer_time": 1,
            },
            {
                "key": "t12",
                "name": "Staff Training",
                "duration": 10,
                "description": "Train all staff on menu items, equipment operation, customer service, and health protocols.",
                "status": TaskStatusEnum.not_started,
                "buffer_time": 2,
            },
            {
                "key": "t13",
                "name": "Health Inspection",
                "duration": 5,
                "description": "Schedule and pass health department inspection. Address any compliance issues.",
                "status": TaskStatusEnum.not_started,
                "buffer_time": 2,
            },
            {
                "key": "t14",
                "name": "Soft Opening",
                "duration": 3,
                "description": "Limited opening for friends, family, and select customers to test operations.",
                "status": TaskStatusEnum.not_started,
                "buffer_time": 1,
            },
            {
                "key": "t15",
                "name": "Grand Opening",
                "duration": 1,
                "description": "Official public opening with marketing event, promotions, and full service.",
                "status": TaskStatusEnum.not_started,
                "buffer_time": 0,
            },
        ]

        # 3. Create Task objects
        print("Creating tasks...")
        today = date.today()
        task_map = {}  # Maps key (t1, t2, etc.) to Task object

        for task_data in tasks_data:
            # Calculate target completion date based on start_date + duration + buffer
            target_date = today + timedelta(days=task_data["duration"] + task_data["buffer_time"])
            
            task = Task(
                name=task_data["name"],
                duration=task_data["duration"],
                description=task_data["description"],
                status=task_data["status"],
                buffer_time=task_data["buffer_time"],
                start_date=today,
                target_completion_date=target_date,
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
