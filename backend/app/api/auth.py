from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User, UserProfile
from app.models.roadmap import UserActivity
from app.schemas.auth import UserCreate, UserLogin, Token, UserResponse, UserProfileUpdate, UserProfileResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name
    )
    db.add(user)
    db.flush()

    # Create empty user profile
    profile = UserProfile(
        user_id=user.id,
        onboarding_completed=False
    )
    db.add(profile)

    # Activity log
    activity = UserActivity(
        user_id=user.id,
        action_type="account_created",
        title="Welcome to Persona Hire! Account successfully created."
    )
    db.add(activity)

    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        onboarding_completed=False
    )


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    onboarding_done = user.profile.onboarding_completed if user.profile else False
    access_token = create_access_token(user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        onboarding_completed=onboarding_done
    )


@router.post("/demo-login", response_model=Token)
def demo_login(db: Session = Depends(get_db)):
    """Provides a one-click demo login for reviewers and instant evaluation."""
    demo_email = "student@personahire.edu"
    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        user = User(
            email=demo_email,
            hashed_password=get_password_hash("DemoStudent2026!"),
            full_name="Alex Chen"
        )
        db.add(user)
        db.flush()

        profile = UserProfile(
            user_id=user.id,
            college="Institute of Technology & Science",
            degree="B.Tech",
            branch="Computer Science & Engineering",
            graduation_year=2026,
            target_role="Full Stack Software Engineer",
            experience_level="Fresher / Final Year Student",
            preferred_interview_categories=["technical", "project", "behavioral"],
            onboarding_completed=True
        )
        db.add(profile)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        onboarding_completed=True
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    for field, value in profile_in.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    profile.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(profile)
    return profile
