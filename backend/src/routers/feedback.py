from http import HTTPStatus
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.database.database import get_session
from src.database.models import Feedback, FeedbackAnswer, User
from src.schemas.feedback import FeedbackRequest, FeedbackList
from src.security import get_current_user

router = APIRouter(
    prefix='/feedback',
    tags=['feedback'],
)

T_Session = Annotated[Session, Depends(get_session)]
T_CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get(
    '/collaborator/auto',
    status_code=HTTPStatus.OK,
    response_model=FeedbackList,
)
def autofeedback_get_collaborator(
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
    print({
        'feedback_id': auto_feedback.id,
        'user_id': auto_feedback.user_id,
        'auto_feedback': auto_feedback.auto_feedback,
        'answers': [
            {
                'question_number': fb.question_number,
                'answer': fb.answer,
                'explanation': fb.explanation,
            }
            for fb in auto_feedback_answers
        ],
    })

    return {
        'feedback_id': auto_feedback.id,
        'user_id': auto_feedback.user_id,
        'auto_feedback': auto_feedback.auto_feedback,
        'answers': [
            {
                'question_number': fb.question_number,
                'answer': fb.answer,
                'explanation': fb.explanation or '',
            }
            for fb in auto_feedback_answers
        ],
    }


@router.get(
    '/collaborator/leader',
    status_code=HTTPStatus.OK,
    response_model=FeedbackList,
)
def leader_feedback_get_collaborator(
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

    leader_feedback = session.scalar(
        select(Feedback).where(
            (Feedback.user_id == db_current_user.id)
            & (~Feedback.auto_feedback)
        )
    )
    if not leader_feedback:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail='Leader Feedback for this user does not exist',
        )

    leader_feedback_answers = session.scalars(
        select(FeedbackAnswer)
        .where((FeedbackAnswer.feedback_id == leader_feedback.id))
        .order_by(FeedbackAnswer.question_number)
    ).all()
    print({
        'feedback_id': leader_feedback.id,
        'user_id': leader_feedback.user_id,
        'auto_feedback': leader_feedback.auto_feedback,
        'answers': [
            {
                'question_number': fb.question_number,
                'answer': fb.answer,
                'explanation': fb.explanation,
            }
            for fb in leader_feedback_answers
        ],
    })

    return {
        'feedback_id': leader_feedback.id,
        'user_id': leader_feedback.user_id,
        'auto_feedback': leader_feedback.auto_feedback,
        'answers': [
            {
                'question_number': fb.question_number,
                'answer': fb.answer,
                'explanation': fb.explanation or '',
            }
            for fb in leader_feedback_answers
        ],
    }


@router.put(
    '/collaborator', status_code=HTTPStatus.OK, response_model=Feedback
)
def feedback_update_collaborator(
    feedback: FeedbackRequest,
    current_user: T_CurrentUser,
    session: T_Session,
):
    print(feedback)
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

    for answer in feedback.answers:
        for fb in auto_feedback_answers:
            if fb.question_number == answer.question_number:
                fb.answer = answer.answer
                fb.explanation = answer.explanation
                session.commit()
                session.refresh(fb)

    return auto_feedback


@router.post(
    '/collaborator', status_code=HTTPStatus.CREATED, response_model=Feedback
)
def feedback_submit_collaborator(
    feedback: FeedbackRequest,
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

    db_feedback = session.scalars(
        select(Feedback).where((Feedback.user_id == db_current_user.id))
    )
    for fb in db_feedback:
        if fb.auto_feedback:
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail='Feedback for this user already exists',
            )

    feedback_instance = Feedback(
        user_id=db_current_user.id,
        auto_feedback=True,
    )  # type: ignore
    print('Auto Feedback created')
    print(feedback_instance)

    session.add(feedback_instance)
    session.commit()
    session.refresh(feedback_instance)

    for answer in feedback.answers:
        print('auto Feedback answer created')
        print(answer)
        print(feedback_instance)
        feedback_answer_instance = FeedbackAnswer(
            feedback_id=feedback_instance.id,
            question_number=answer.question_number,
            answer=answer.answer,
            explanation=answer.explanation,
        )  # type: ignore
        session.add(feedback_answer_instance)
        session.commit()
        session.refresh(feedback_answer_instance)

    return feedback_instance


@router.post(
    '/leader', status_code=HTTPStatus.CREATED, response_model=Feedback
)
def feedback_submit_leader(
    feedback: FeedbackRequest,
    user_to_evaluate_id: int,
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

    if not db_current_user.is_leader:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail='Only leaders can submit feedback for other users',
        )

    db_user_to_evaluate = session.scalar(
        select(User).where((User.id == user_to_evaluate_id))
    )

    if not db_user_to_evaluate:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail='User to evaluate not found',
        )

    db_feedback = session.scalars(
        select(Feedback).where((Feedback.user_id == user_to_evaluate_id))
    )
    for fb in db_feedback:
        if not fb.auto_feedback:
            raise HTTPException(
                status_code=HTTPStatus.BAD_REQUEST,
                detail='Feedback for this user already exists',
            )

    feedback_instance = Feedback(
        user_id=user_to_evaluate_id,
        auto_feedback=False,
    )  # type: ignore
    print('leader Feedback created')
    print(feedback_instance)

    session.add(feedback_instance)
    session.commit()
    session.refresh(feedback_instance)

    for answer in feedback.answers:
        print('leader Feedback answer created')
        print(answer)
        print(feedback_instance)
        feedback_answer_instance = FeedbackAnswer(
            feedback_id=feedback_instance.id,
            question_number=answer.question_number,
            answer=answer.answer,
            explanation=answer.explanation,
        )  # type: ignore
        session.add(feedback_answer_instance)
        session.commit()
        session.refresh(feedback_answer_instance)

    return feedback_instance
