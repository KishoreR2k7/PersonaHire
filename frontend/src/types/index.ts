export interface UserProfile {
  id: string;
  user_id: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduation_year?: number;
  target_role?: string;
  experience_level?: string;
  preferred_interview_categories: string[];
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  profile?: UserProfile;
}

export interface ContactInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface ExperienceItem {
  id?: string;
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date: string;
  current: boolean;
  bullets: string[];
  tech_stack: string[];
}

export interface ProjectItem {
  id?: string;
  title: string;
  description: string;
  role: string;
  live_url?: string;
  repo_url?: string;
  bullets: string[];
  tech_stack: string[];
}

export interface EducationItem {
  id?: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  gpa?: string;
  highlights: string[];
}

export interface CertificationItem {
  id?: string;
  name: string;
  issuer: string;
  issue_date: string;
  credential_url?: string;
}

export interface StructuredResume {
  contact: ContactInfo;
  summary: string;
  skills: SkillGroup[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  achievements: string[];
}

export interface CategoryScores {
  skills_relevance: number;
  projects_experience: number;
  work_achievements: number;
  education_certs: number;
  ats_readability: number;
  writing_impact: number;
}

export interface WeakBulletRewrite {
  original: string;
  improved: string;
  reason: string;
  impact_metric_added: boolean;
}

export interface PrioritizedChecklistItem {
  id: string;
  task: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimated_impact: string;
}

export interface ResumeAnalysis {
  id: string;
  resume_id: string;
  user_id: string;
  overall_score: number;
  category_scores: CategoryScores;
  strengths: string[];
  missing_sections: string[];
  weak_bullet_rewrites: WeakBulletRewrite[];
  missing_measurable_achievements: string[];
  skill_gaps: string[];
  ats_concerns: string[];
  actionable_recommendations: string[];
  prioritized_checklist: PrioritizedChecklistItem[];
  verified_facts: Record<string, any>;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  file_name?: string;
  file_size_bytes?: number;
  file_type?: string;
  is_primary: boolean;
  structured_data: StructuredResume;
  latest_score?: number;
  latest_analysis?: ResumeAnalysis;
  created_at: string;
  updated_at: string;
}

export interface JobMatch {
  id: string;
  user_id: string;
  resume_id: string;
  job_title: string;
  company_name?: string;
  job_text: string;
  match_score: number;
  rubric_breakdown: Record<string, any>;
  matched_skills: string[];
  missing_skills: string[];
  required_vs_preferred: {
    required_met?: string[];
    required_missing?: string[];
    preferred_met?: string[];
    preferred_missing?: string[];
  };
  relevant_projects: Array<{ project_title: string; relevance_reason: string }>;
  keyword_coverage: number;
  sections_to_improve: string[];
  recommended_topics: string[];
  suggested_interview_questions: Array<{ question: string; target_skill: string; tips: string }>;
  tailored_resume_suggestions: Record<string, any>;
  created_at: string;
}

export interface InterviewQuestion {
  id: string;
  session_id: string;
  order_index: number;
  question_text: string;
  category: string;
  context_topic?: string;
  is_follow_up: boolean;
}

export interface AnswerFeedback {
  id: string;
  question_id: string;
  score: number;
  technical_accuracy: number;
  clarity_communication: number;
  depth_of_explanation: number;
  star_format_score: number;
  feedback: string;
  key_strengths: string[];
  areas_for_improvement: string[];
  is_interview_complete: boolean;
  next_question?: InterviewQuestion;
  interviewer_thought?: string | null;
  interviewer_reply?: string | null;
}

export interface InterviewEvaluation {
  id: string;
  session_id: string;
  overall_performance_score: number;
  communication_clarity_score: number;
  technical_correctness_score: number;
  relevance_score: number;
  depth_score: number;
  problem_solving_score: number;
  star_method_adherence: number;
  summary_verdict: string;
  strong_answers: Array<{ question: string; answer_snippet: string; highlight: string }>;
  weak_answers: Array<{ question: string; reason: string; suggestion: string }>;
  improved_sample_answers: Array<{ question: string; improved_response: string }>;
  personalized_exercises: string[];
  recommended_next_interview?: string;
  created_at: string;
}

export interface InterviewSessionItem {
  id: string;
  target_role: string;
  interview_type: string;
  difficulty: string;
  duration_minutes: number;
  total_questions: number;
  interaction_mode: string;
  status: string;
  current_question_index: number;
  overall_score?: number;
  created_at: string;
  completed_at?: string;
}

export interface PreparationTask {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string;
  priority: string;
  estimated_duration_minutes: number;
  is_completed: boolean;
  completed_at?: string;
  supporting_resources: string[];
  created_at: string;
}

export interface DashboardStats {
  latest_resume_score?: number;
  resume_score_change?: number;
  interviews_completed: number;
  average_interview_score?: number;
  job_matches_count: number;
  tasks_completed_count: number;
  total_tasks_count: number;
  readiness_percentage: number;
  readiness_dimensions: {
    resume_quality: number;
    technical_skills: number;
    communication: number;
    project_depth: number;
    ats_readiness: number;
    interview_acumen: number;
  };
  next_best_action: {
    title: string;
    description: string;
    cta_label: string;
    cta_route: string;
    priority: string;
  };
  recent_activities: Array<{
    id: string;
    action_type: string;
    title: string;
    details: Record<string, any>;
    created_at: string;
  }>;
  interview_trends: Array<{
    session_id: string;
    date: string;
    score: number;
    role: string;
  }>;
}
