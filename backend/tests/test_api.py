import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_and_health():
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json()["status"] == "online"

    health = client.get("/api/v1/diagnostics/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"


def test_ai_status():
    resp = client.get("/api/v1/diagnostics/ai-status")
    assert resp.status_code == 200
    data = resp.json()
    assert "active_provider" in data
    assert "groq_model" in data


def test_demo_login():
    resp = client.post("/api/v1/auth/demo-login")
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["email"] == "student@personahire.edu"


def test_auth_registration_and_login():
    email = "testuser_alex@personahire.edu"
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "SecurePassword123!", "full_name": "Alex Mercer"}
    )
    # 201 or 400 if rerun
    if reg_resp.status_code == 201:
        assert "access_token" in reg_resp.json()
    
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "SecurePassword123!"}
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # Verify /me
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == email


def test_resume_create_and_analyze():
    # Login as demo
    login = client.post("/api/v1/auth/demo-login").json()
    token = login["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create blank resume
    create_resp = client.post("/api/v1/resumes/create-blank?title=Alex_Engineering_Resume", headers=headers)
    assert create_resp.status_code == 200
    resume_id = create_resp.json()["id"]

    # Analyze resume
    analyze_resp = client.post(f"/api/v1/resumes/{resume_id}/analyze", headers=headers)
    assert analyze_resp.status_code == 200
    analysis = analyze_resp.json()
    assert 0 <= analysis["overall_score"] <= 100
    assert "category_scores" in analysis
    assert "strengths" in analysis
    assert "prioritized_checklist" in analysis


def test_bullet_rewrite():
    login = client.post("/api/v1/auth/demo-login").json()
    token = login["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(
        "/api/v1/resumes/rewrite-bullet",
        json={
            "bullet_point": "worked on frontend react website",
            "role_or_project": "Web Developer",
            "target_role": "Frontend Engineer"
        },
        headers=headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "suggested_rewrite" in data
    assert "action_verb_used" in data


def test_mock_interview_flow():
    login = client.post("/api/v1/auth/demo-login").json()
    token = login["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Start session
    start_resp = client.post(
        "/api/v1/interviews/start",
        json={
            "target_role": "Software Engineer",
            "interview_type": "technical",
            "difficulty": "intermediate",
            "total_questions": 2
        },
        headers=headers
    )
    assert start_resp.status_code == 200
    start_data = start_resp.json()
    session_id = start_data["session_id"]
    q1 = start_data["first_question"]
    assert q1["question_text"]

    # Submit answer 1
    ans1_resp = client.post(
        f"/api/v1/interviews/{session_id}/answer",
        json={
            "question_id": q1["id"],
            "answer_text": "I developed REST APIs using Python and FastAPI, implementing caching with Redis which reduced our latency by 40% in production.",
            "time_taken_seconds": 35
        },
        headers=headers
    )
    assert ans1_resp.status_code == 200
    feedback1 = ans1_resp.json()
    assert feedback1["score"] > 0
    assert not feedback1["is_interview_complete"]
    q2 = feedback1["next_question"]
    assert q2 is not None

    # Submit answer 2 (completing interview)
    ans2_resp = client.post(
        f"/api/v1/interviews/{session_id}/answer",
        json={
            "question_id": q2["id"],
            "answer_text": "When investigating production issues, I first inspect server logs and APM telemetry, isolate the failing component in a staging environment, write a regression test, and roll out a patch with blue-green deployment.",
            "time_taken_seconds": 45
        },
        headers=headers
    )
    assert ans2_resp.status_code == 200
    feedback2 = ans2_resp.json()
    assert feedback2["is_interview_complete"]

    # Get final evaluation
    eval_resp = client.get(f"/api/v1/interviews/{session_id}/evaluation", headers=headers)
    assert eval_resp.status_code == 200
    evaluation = eval_resp.json()
    assert evaluation["overall_performance_score"] > 0
    assert "summary_verdict" in evaluation


def test_audio_transcription_endpoint():
    login = client.post("/api/v1/auth/demo-login").json()
    token = login["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Synthesize minimal wav file in memory
    import io, wave
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        wf.writeframes(b'\x00\x00' * 16000)
    buf.seek(0)

    files = {"file": ("speech.wav", buf.read(), "audio/wav")}
    resp = client.post("/api/v1/interviews/transcribe", headers=headers, files=files)
    assert resp.status_code == 200
    data = resp.json()
    assert "text" in data
    assert data["provider"] == "groq"

