import logging
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.interview import InterviewSession, InterviewQuestion, InterviewAnswer, InterviewEvaluation
from app.models.roadmap import UserActivity
from app.schemas.interview import (
    InterviewCreate, InterviewSessionListItem, InterviewSessionDetail,
    InterviewQuestionResponse, AnswerSubmit, AnswerFeedbackResponse, InterviewEvaluationResponse
)
from app.services.ai_service import AIService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/interviews", tags=["AI Mock Interviews"])


@router.post("/start")
async def start_interview_session(
    setup: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve resume if provided or fetch primary
    resume = None
    if setup.resume_id:
        resume = db.query(Resume).filter(Resume.id == setup.resume_id, Resume.user_id == current_user.id).first()
    elif current_user.resumes:
        resume = current_user.resumes[0]

    resume_data = resume.structured_data if resume else {}

    # Create session
    session = InterviewSession(
        user_id=current_user.id,
        resume_id=resume.id if resume else None,
        target_role=setup.target_role,
        interview_type=setup.interview_type,
        difficulty=setup.difficulty,
        duration_minutes=setup.duration_minutes,
        total_questions=setup.total_questions,
        interaction_mode=setup.interaction_mode,
        status="in_progress",
        current_question_index=0
    )
    db.add(session)
    db.flush()

    # Generate first opening question
    first_q_data = await AIService.generate_interview_question(
        target_role=setup.target_role,
        interview_type=setup.interview_type,
        difficulty=setup.difficulty,
        question_index=0,
        total_questions=setup.total_questions,
        resume_data=resume_data,
        previous_dialogue=[]
    )

    first_question = InterviewQuestion(
        session_id=session.id,
        order_index=1,
        question_text=first_q_data["question_text"],
        category=first_q_data.get("category", setup.interview_type),
        context_topic=first_q_data.get("context_topic"),
        is_follow_up=first_q_data.get("is_follow_up", False)
    )
    db.add(first_question)
    db.commit()
    db.refresh(session)
    db.refresh(first_question)

    return {
        "session_id": session.id,
        "target_role": session.target_role,
        "interview_type": session.interview_type,
        "difficulty": session.difficulty,
        "total_questions": session.total_questions,
        "current_question_index": 1,
        "interviewer_thought": first_q_data.get("interviewer_thought"),
        "interviewer_reply": first_q_data.get("interviewer_reply"),
        "first_question": {
            "id": first_question.id,
            "session_id": session.id,
            "order_index": 1,
            "question_text": first_question.question_text,
            "category": first_question.category,
            "context_topic": first_question.context_topic,
            "is_follow_up": first_question.is_follow_up
        }
    }


@router.get("/", response_model=List[InterviewSessionListItem])
def get_user_interviews(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(InterviewSession).filter(InterviewSession.user_id == current_user.id).order_by(InterviewSession.created_at.desc()).all()
    return sessions


@router.get("/{session_id}", response_model=InterviewSessionDetail)
def get_interview_detail(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")
    return session


@router.post("/{session_id}/answer", response_model=AnswerFeedbackResponse)
async def submit_answer(
    session_id: str,
    submission: AnswerSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    question = db.query(InterviewQuestion).filter(InterviewQuestion.id == submission.question_id, InterviewQuestion.session_id == session.id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found in this session.")

    # Evaluate the answer
    eval_result = await AIService.evaluate_interview_answer(
        question_text=question.question_text,
        answer_text=submission.answer_text,
        target_role=session.target_role,
        interview_type=session.interview_type
    )

    # Save answer
    answer = InterviewAnswer(
        question_id=question.id,
        answer_text=submission.answer_text,
        time_taken_seconds=submission.time_taken_seconds,
        score=eval_result["score"],
        technical_accuracy=eval_result.get("technical_accuracy"),
        clarity_communication=eval_result.get("clarity_communication"),
        depth_of_explanation=eval_result.get("depth_of_explanation"),
        star_format_score=eval_result.get("star_format_score"),
        feedback=eval_result.get("feedback"),
        key_strengths=eval_result.get("key_strengths", []),
        areas_for_improvement=eval_result.get("areas_for_improvement", [])
    )
    db.add(answer)
    db.flush()

    # Determine if next question is needed
    current_count = db.query(InterviewQuestion).filter(InterviewQuestion.session_id == session.id).count()
    is_complete = current_count >= session.total_questions

    next_q_resp = None
    interviewer_thought = None
    interviewer_reply = None

    if not is_complete:
        # Collect prior dialogue for context
        all_qs = db.query(InterviewQuestion).filter(InterviewQuestion.session_id == session.id).order_by(InterviewQuestion.order_index).all()
        dialogue = []
        for q in all_qs:
            ans = q.answers[0] if q.answers else None
            dialogue.append({
                "question": q.question_text,
                "answer": ans.answer_text if ans else ""
            })

        resume_data = session.resume.structured_data if session.resume else {}

        next_q_data = await AIService.generate_interview_question(
            target_role=session.target_role,
            interview_type=session.interview_type,
            difficulty=session.difficulty,
            question_index=current_count,
            total_questions=session.total_questions,
            resume_data=resume_data,
            previous_dialogue=dialogue
        )

        next_q = InterviewQuestion(
            session_id=session.id,
            order_index=current_count + 1,
            question_text=next_q_data["question_text"],
            category=next_q_data.get("category", "technical"),
            context_topic=next_q_data.get("context_topic"),
            is_follow_up=next_q_data.get("is_follow_up", False)
        )
        db.add(next_q)
        db.flush()
        session.current_question_index = current_count + 1
        interviewer_thought = next_q_data.get("interviewer_thought")
        interviewer_reply = next_q_data.get("interviewer_reply")

        next_q_resp = InterviewQuestionResponse.model_validate(next_q)
    else:
        # Finalize interview session
        session.status = "completed"
        session.completed_at = datetime.now(timezone.utc)

        # Build QA pairs for overall evaluation
        all_qs = db.query(InterviewQuestion).filter(InterviewQuestion.session_id == session.id).all()
        qa_pairs = []
        scores = []
        for q in all_qs:
            ans = q.answers[0] if q.answers else None
            if ans:
                scores.append(ans.score or 70)
                qa_pairs.append({
                    "question": q.question_text,
                    "answer": ans.answer_text,
                    "score": ans.score
                })

        avg_score = int(sum(scores) / max(1, len(scores)))
        session.overall_score = avg_score

        # Generate final comprehensive evaluation
        final_eval = await AIService.generate_final_interview_evaluation(
            target_role=session.target_role,
            session_data={"interview_type": session.interview_type, "difficulty": session.difficulty},
            qa_pairs=qa_pairs
        )

        eval_model = InterviewEvaluation(
            session_id=session.id,
            overall_performance_score=final_eval.get("overall_performance_score", avg_score),
            communication_clarity_score=final_eval.get("communication_clarity_score", avg_score),
            technical_correctness_score=final_eval.get("technical_correctness_score", avg_score),
            relevance_score=final_eval.get("relevance_score", avg_score),
            depth_score=final_eval.get("depth_score", avg_score),
            problem_solving_score=final_eval.get("problem_solving_score", avg_score),
            star_method_adherence=final_eval.get("star_method_adherence", 75),
            summary_verdict=final_eval.get("summary_verdict", "Good overall interview performance."),
            strong_answers=final_eval.get("strong_answers", []),
            weak_answers=final_eval.get("weak_answers", []),
            improved_sample_answers=final_eval.get("improved_sample_answers", []),
            personalized_exercises=final_eval.get("personalized_exercises", []),
            recommended_next_interview=final_eval.get("recommended_next_interview")
        )
        db.add(eval_model)

        # Log activity
        activity = UserActivity(
            user_id=current_user.id,
            action_type="mock_interview_finished",
            title=f"Completed {session.target_role} Mock Interview — Score: {avg_score}/100",
            details={"session_id": session.id, "score": avg_score}
        )
        db.add(activity)

    db.commit()
    db.refresh(answer)

    return AnswerFeedbackResponse(
        id=answer.id,
        question_id=question.id,
        score=eval_result["score"],
        technical_accuracy=eval_result.get("technical_accuracy", 70),
        clarity_communication=eval_result.get("clarity_communication", 70),
        depth_of_explanation=eval_result.get("depth_of_explanation", 70),
        star_format_score=eval_result.get("star_format_score", 70),
        feedback=eval_result.get("feedback", ""),
        key_strengths=eval_result.get("key_strengths", []),
        areas_for_improvement=eval_result.get("areas_for_improvement", []),
        is_interview_complete=is_complete,
        next_question=next_q_resp,
        interviewer_thought=interviewer_thought,
        interviewer_reply=interviewer_reply
    )


@router.get("/{session_id}/evaluation", response_model=InterviewEvaluationResponse)
def get_session_evaluation(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")
    if not session.evaluation:
        raise HTTPException(status_code=404, detail="Interview has not been evaluated yet or is still in progress.")
    return session.evaluation


@router.post("/transcribe")
async def transcribe_interview_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Transcribes audio recorded during mock interviews using Groq Whisper API (whisper-large-v3-turbo).
    """
    if not file:
        raise HTTPException(status_code=400, detail="No audio file received")

    audio_bytes = await file.read()
    if not audio_bytes or len(audio_bytes) < 100:
        raise HTTPException(status_code=400, detail="Audio recording was empty or too short.")

    filename = file.filename or "recording.webm"
    content_type = file.content_type or "audio/webm"

    try:
        result = await AIService.transcribe_audio(
            audio_bytes=audio_bytes,
            filename=filename,
            content_type=content_type
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to transcribe audio: {e}")
        raise HTTPException(status_code=500, detail=f"Audio transcription failed: {str(e)}")

