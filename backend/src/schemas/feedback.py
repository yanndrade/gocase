from pydantic import BaseModel, ConfigDict


class FeedbackResponse(BaseModel):
    question_number: int
    answer: int
    explanation: str = ''


class FeedbackRequest(BaseModel):
    answers: list[FeedbackResponse]


class FeedbackList(FeedbackRequest):
    feedback_id: int
    user_id: int
    auto_feedback: bool
    answers: list[FeedbackResponse]


class FeedbackRequestDB(FeedbackRequest):
    id: int
    user_id: int
    auto_feedback: bool
