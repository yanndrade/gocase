from datetime import datetime, timedelta
from http import HTTPStatus
from typing import Annotated
from zoneinfo import ZoneInfo

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt import decode, encode
from jwt.exceptions import ExpiredSignatureError, PyJWTError
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.database.database import get_session
from src.database.models import User
from src.settings import Settings

T_Session = Annotated[Session, Depends(get_session)]
pwd_context = PasswordHash.recommended()


OAUTH2_SCHEME = OAuth2PasswordBearer(tokenUrl='auth/token')


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data_payload: dict) -> str:
    to_encode = data_payload.copy()
    expire = datetime.now(tz=ZoneInfo('UTC')) + timedelta(
        minutes=Settings().ACCESS_TOKEN_EXPIRE_MINUTES  # type: ignore
    )

    to_encode.update({'exp': expire})

    encoded_jwt = encode(
        to_encode,
        Settings().SECRET_KEY,  # type: ignore
        algorithm=Settings().ALGORITHM,  # type: ignore
    )  # type: ignore

    return encoded_jwt


def get_current_user(
    session: T_Session,
    token: str = Depends(OAUTH2_SCHEME),
) -> User:
    credentials_exception = HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'},
    )
    try:
        payload = decode(
            token,
            Settings().SECRET_KEY,  # type: ignore
            algorithms=[Settings().ALGORITHM],  # type: ignore
        )  # type: ignore

        email: str = payload.get('sub')

        if not email:
            raise credentials_exception

    except ExpiredSignatureError:
        raise credentials_exception
    except PyJWTError:
        raise credentials_exception

    user_db = session.scalar(select(User).where(User.email == email))

    if user_db is None:
        raise credentials_exception

    return user_db
