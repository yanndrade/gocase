from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.assistant.assistant_config import IAgoAssistant
from src.database.database import get_session
from src.database.models import Feedback, FeedbackAnswer, IAMessageStore, User
from src.schemas.message import Message
from src.security import get_current_user

router = APIRouter(
    prefix='/iago',
    tags=['iago'],
)

T_Session = Annotated[Session, Depends(get_session)]
T_CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get('/', status_code=HTTPStatus.OK, response_model=Message)
def get_assistant_feedback(
    current_user: T_CurrentUser,
    session: T_Session,
):
    db_current_user = session.scalar(
        select(User).where((User.email == current_user.email))
    )

    if not db_current_user:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail='User not found',
        )

    if db_current_user.is_leader:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail='User is a leader',
        )

    auto_feedback = session.scalar(
        select(Feedback).where(
            (Feedback.user_id == db_current_user.id) & (Feedback.auto_feedback)
        )
    )
    if not auto_feedback:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail='Feedback for this user does not exist',
        )

    auto_feedback_answers = session.scalars(
        select(FeedbackAnswer)
        .where((FeedbackAnswer.feedback_id == auto_feedback.id))
        .order_by(FeedbackAnswer.question_number)
    ).all()

    if not auto_feedback_answers:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail='Feedback answers for this user does not exist',
        )
    print('Auto Feedback')
    print(auto_feedback)
    print(auto_feedback_answers)
    print('End Auto Feedback')

    print('-----------------------------------')

    leader_feedback = session.scalar(
        select(Feedback).where(
            (Feedback.user_id == db_current_user.id)
            & (~Feedback.auto_feedback)
        )
    )
    if not leader_feedback:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail='Feedback for this user does not exist',
        )
    leader_feedback_answers = session.scalars(
        select(FeedbackAnswer)
        .where((FeedbackAnswer.feedback_id == leader_feedback.id))
        .order_by(FeedbackAnswer.question_number)
    ).all()

    print('Leader Feedback')
    print(leader_feedback)
    print(leader_feedback_answers)
    print('End Auto Feedback')

    if len(auto_feedback_answers) != len(leader_feedback_answers):
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail='Feedback answers for this user does not match',
        )

    final_score = []

    for af in auto_feedback_answers:
        for lf in leader_feedback_answers:
            if af.question_number == lf.question_number:
                mean = (af.answer + lf.answer) / 2
                final_score.append({
                    'question_number': af.question_number,
                    'final_score': (mean * 0.15)
                    + (af.answer * 0.15)
                    + (lf.answer * 0.7),
                })

    print(final_score)

    assistant_input = {}
    for i in range(len(auto_feedback_answers)):
        assistant_input[f'colaborador_q{i + 1}'] = auto_feedback_answers[
            i
        ].answer
        assistant_input[f'colaborador_q{i + 1}_justificativa'] = (
            auto_feedback_answers[i].explanation  # type: ignore
        )
        assistant_input[f'lider_q{i + 1}'] = leader_feedback_answers[i].answer
        assistant_input[f'lider_q{i + 1}_justificativa'] = (
            leader_feedback_answers[i].explanation  # type: ignore
        )
        assistant_input[f'final_q{i + 1}'] = final_score[i]['final_score']  # type: ignore

    assistant_input['nome_colaborador'] = db_current_user.name  # type: ignore

    try:
        IAgo = IAgoAssistant()
    except Exception as e:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail=str(e),
        )

    IAgo.get_assistant()
    message = IAgo.run_assistant(assistant_input)

    print('Inserting into message store')

    message_store = IAMessageStore(
        user_id=db_current_user.id,  # type: ignore
        message=message,  # type: ignore
        score=0,  # type: ignore
    )
    session.add(message_store)
    session.commit()
    session.refresh(message_store)
    return {'message': message_store.message}


@router.get('/message', status_code=HTTPStatus.OK, response_model=Message)
def get_assistant_feedback_message(
    current_user: T_CurrentUser,
    session: T_Session,
):
    db_current_user = session.scalar(
        select(User).where((User.email == current_user.email))
    )

    if not db_current_user:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail='User not found',
        )

    message_store = session.scalar(
        select(IAMessageStore).where(
            (IAMessageStore.user_id == db_current_user.id)
        )
    )

    if not message_store:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail='Message not found',
        )

    return {'message': message_store.message}


@router.delete('/', status_code=HTTPStatus.OK, response_model=Message)
def delete_assistant_feedback(
    current_user: T_CurrentUser,
    session: T_Session,
):
    db_current_user = session.scalar(
        select(User).where((User.email == current_user.email))
    )

    if not db_current_user:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail='User not found',
        )

    message_store = session.scalar(
        select(IAMessageStore).where(
            (IAMessageStore.user_id == db_current_user.id)
        )
    )

    if not message_store:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail='Message not found',
        )

    session.delete(message_store)
    session.commit()
    return {'message': 'Deleted successfully'}


@router.put('/score', status_code=HTTPStatus.OK, response_model=Message)
def score_assistant_feedback(
    user: T_CurrentUser,
    score: int,
    session: T_Session,
):
    message_store = session.scalar(
        select(IAMessageStore).where((IAMessageStore.user_id == user.id))
    )

    if not message_store:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail='Message not found',
        )

    message_store.score = bool(score)
    session.commit()
    session.refresh(message_store)
    return {'message': 'Scored successfully'}
