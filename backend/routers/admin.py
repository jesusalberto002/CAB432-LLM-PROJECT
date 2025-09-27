# backend/routers/admin.py
from fastapi import APIRouter, Depends
from ..auth import get_current_admin_user
from .. import models

router = APIRouter()

@router.get("/admin/healthcheck")
def admin_health_check(current_user: models.User = Depends(get_current_admin_user)):
    """
    A protected endpoint that only users in the 'Admins' group can access.
    """
    return {"message": f"Welcome Admin {current_user.username}! The system is healthy."}