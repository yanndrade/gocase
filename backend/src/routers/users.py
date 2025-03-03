from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.database import get_session
from src.database.models import User
from src.schemas.users import (
    UserPublic,
)
from src.security import get_current_user

# noqa: I001
T_Session = Annotated[Session, Depends(get_session)]
T_CurrentUser = Annotated[User, Depends(get_current_user)]
router = APIRouter(
    prefix='/users',
    tags=['users'],
)


@router.get('/me', status_code=HTTPStatus.OK, response_model=UserPublic)
def get_user_info(
    current_user: T_CurrentUser,
) -> UserPublic:
    return UserPublic.model_validate(current_user)
