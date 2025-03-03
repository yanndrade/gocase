from datetime import datetime

from sqlalchemy import CheckConstraint, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, registry

table_registry = registry()


@table_registry.mapped_as_dataclass
class User:
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(init=False, primary_key=True)
    name: Mapped[str]
    password: Mapped[str]
    email: Mapped[str] = mapped_column(unique=True)
    is_leader: Mapped[bool]
    created_at: Mapped[datetime] = mapped_column(
        init=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        init=False, server_default=func.now(), onupdate=func.now()
    )


# Interessante caso queira adicionar novas perguntas,
# basta adicionar no banco de dados, e criar um novo registro
# na tabela de perguntas, sem a necessidade de alterar o código
# fonte.
# @table_registry.mapped_as_dataclass
# class Question:
#    __tablename__ = 'questions'
#    id: Mapped[int] = mapped_column(init=False, primary_key=True)
#    question_number: Mapped[int]
#    criterion: Mapped[str]
#    description: Mapped[str]
#    created_at: Mapped[datetime] = mapped_column(
#        init=False, server_default=func.now()
#    )
#    updated_at: Mapped[datetime] = mapped_column(
#        init=False, server_default=func.now(), onupdate=func.now()
#    )


@table_registry.mapped_as_dataclass
class Feedback:
    __tablename__ = 'feedback'
    id: Mapped[int] = mapped_column(init=False, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    auto_feedback: Mapped[bool]
    created_at: Mapped[datetime] = mapped_column(
        init=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        init=False, server_default=func.now(), onupdate=func.now()
    )


@table_registry.mapped_as_dataclass
class FeedbackAnswer:
    __tablename__ = 'feedback_answers'
    id: Mapped[int] = mapped_column(init=False, primary_key=True)
    feedback_id: Mapped[int] = mapped_column(ForeignKey('feedback.id'))
    question_number: Mapped[int]
    answer: Mapped[int] = mapped_column(
        CheckConstraint('answer >= 1 AND answer <= 5')
    )
    explanation: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(
        init=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        init=False, server_default=func.now(), onupdate=func.now()
    )


@table_registry.mapped_as_dataclass
class IAMessageStore:
    __tablename__ = 'ia_message_store'
    id: Mapped[int] = mapped_column(init=False, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    message: Mapped[str]
    score: Mapped[bool]  # good or bad response
    created_at: Mapped[datetime] = mapped_column(
        init=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        init=False, server_default=func.now(), onupdate=func.now()
    )
