from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.task import Task, TaskStatus, TaskPriority
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from app.routers.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task."""
    task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        priority=task_data.priority,
        due_date=task_data.due_date,
        owner_id=current_user.id
    )
    
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get("/", response_model=TaskListResponse)
async def get_tasks(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    search: Optional[str] = None,
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's tasks with filtering and pagination."""
    query = db.query(Task).filter(Task.owner_id == current_user.id)
    
    # Apply filters
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if search:
        query = query.filter(Task.title.ilike(f"%{search}%"))
    
    # Apply sorting
    if sort_order == "desc":
        query = query.order_by(desc(getattr(Task, sort_by)))
    else:
        query = query.order_by(asc(getattr(Task, sort_by)))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    tasks = query.offset((page - 1) * per_page).limit(per_page).all()
    
    # Calculate total pages
    total_pages = (total + per_page - 1) // per_page
    
    return TaskListResponse(
        tasks=tasks,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific task by ID."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.owner_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a specific task."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.owner_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Update task fields
    update_data = task_update.dict(exclude_unset=True)
    
    # Handle status change to completed
    if "status" in update_data and update_data["status"] == TaskStatus.COMPLETED:
        update_data["completed_at"] = datetime.utcnow()
    elif "status" in update_data and update_data["status"] != TaskStatus.COMPLETED:
        update_data["completed_at"] = None
    
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific task."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.owner_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}

@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def complete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a task as completed."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.owner_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task.status = TaskStatus.COMPLETED
    task.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(task)
    return task

@router.get("/stats/summary")
async def get_task_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get task statistics for the current user."""
    total_tasks = db.query(Task).filter(Task.owner_id == current_user.id).count()
    completed_tasks = db.query(Task).filter(
        Task.owner_id == current_user.id,
        Task.status == TaskStatus.COMPLETED
    ).count()
    pending_tasks = db.query(Task).filter(
        Task.owner_id == current_user.id,
        Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS])
    ).count()
    
    # Tasks by priority
    priority_stats = {}
    for priority in TaskPriority:
        count = db.query(Task).filter(
            Task.owner_id == current_user.id,
            Task.priority == priority
        ).count()
        priority_stats[priority.value] = count
    
    # Tasks by status
    status_stats = {}
    for status in TaskStatus:
        count = db.query(Task).filter(
            Task.owner_id == current_user.id,
            Task.status == status
        ).count()
        status_stats[status.value] = count
    
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "completion_rate": round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 2),
        "priority_stats": priority_stats,
        "status_stats": status_stats
    }
