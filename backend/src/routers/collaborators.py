from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.database.database import get_session
from src.database.models import User
from src.schemas.users import (
    UserList,
    UserPublic,
    UserSchema,
)
from src.security import get_current_user, get_password_hash

# noqa: I001
T_Session = Annotated[Session, Depends(get_session)]
T_CurrentUser = Annotated[User, Depends(get_current_user)]
router = APIRouter(
    prefix='/users',
    tags=['users'],
)


@router.post('/', status_code=HTTPStatus.CREATED, response_model=UserPublic)
def create_user_collaborator(user: UserSchema, session: T_Session):
    db_user = session.scalar(select(User).where((User.email == user.email)))

    if db_user:
        if db_user.email == user.email:
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail='Email already exists',
            )
    db_user = User(
        name=user.name,
        password=get_password_hash(user.password),
        email=user.email,
        is_leader=False,
    )  # type: ignore

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return db_user


@router.get('/', status_code=HTTPStatus.OK, response_model=UserList)
def read_all_collaborators(
    session: T_Session,
    current_user: T_CurrentUser,
    limit: int = 10,
    offset: int = 0,
):
    if not current_user.is_leader:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail='User is not a leader',
        )
    users = session.scalars(
        select(User).where(~User.is_leader).limit(limit).offset(offset)
    )

    return {'users': users}
