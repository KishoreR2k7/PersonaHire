const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_PREFIX = `${API_BASE_URL}/api/v1`;

class ApiClient {
  private getHeaders(isFormData = false): HeadersInit {
    const token = localStorage.getItem('persona_hire_token');
    const headers: Record<string, string> = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const isFormData = options.body instanceof FormData;
    const url = `${API_PREFIX}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(isFormData),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = 'An unexpected error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ access_token: string; email: string; full_name: string; onboarding_completed: boolean }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
  }

  async register(full_name: string, email: string, password: string) {
    return this.request<{ access_token: string; email: string; full_name: string; onboarding_completed: boolean }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ full_name, email, password }) }
    );
  }

  async demoLogin() {
    return this.request<{ access_token: string; email: string; full_name: string; onboarding_completed: boolean }>(
      '/auth/demo-login',
      { method: 'POST' }
    );
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async updateProfile(profileData: any) {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Resumes
  async uploadResume(formData: FormData) {
    return this.request<any>('/resumes/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async createBlankResume(title: string) {
    return this.request<any>(`/resumes/create-blank?title=${encodeURIComponent(title)}`, {
      method: 'POST',
    });
  }

  async getResumes() {
    return this.request<any[]>('/resumes/');
  }

  async getResume(id: string) {
    return this.request<any>(`/resumes/${id}`);
  }

  async updateResume(id: string, data: any) {
    return this.request<any>(`/resumes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteResume(id: string) {
    return this.request<{ message: string }>(`/resumes/${id}`, {
      method: 'DELETE',
    });
  }

  async analyzeResume(id: string) {
    return this.request<any>(`/resumes/${id}/analyze`, {
      method: 'POST',
    });
  }

  async getLatestAnalysis(resumeId: string) {
    return this.request<any>(`/resumes/${resumeId}/analyses/latest`);
  }

  async rewriteBullet(bullet_point: string, role_or_project?: string, target_role?: string) {
    return this.request<any>('/resumes/rewrite-bullet', {
      method: 'POST',
      body: JSON.stringify({ bullet_point, role_or_project, target_role }),
    });
  }

  async improveSummary(current_summary: string, target_role?: string, skills: string[] = []) {
    return this.request<any>('/resumes/improve-summary', {
      method: 'POST',
      body: JSON.stringify({ current_summary, target_role, skills }),
    });
  }

  // Job Matching
  async matchJob(resume_id: string, job_title: string, company_name: string, job_text: string) {
    return this.request<any>('/job-matches/match', {
      method: 'POST',
      body: JSON.stringify({ resume_id, job_title, company_name, job_text }),
    });
  }

  async getJobMatches() {
    return this.request<any[]>('/job-matches/');
  }

  async getJobMatch(id: string) {
    return this.request<any>(`/job-matches/${id}`);
  }

  // Mock Interviews
  async startInterview(config: any) {
    return this.request<any>('/interviews/start', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getInterviews() {
    return this.request<any[]>('/interviews/');
  }

  async getInterview(id: string) {
    return this.request<any>(`/interviews/${id}`);
  }

  async submitAnswer(sessionId: string, questionId: string, answerText: string, timeTaken: number) {
    return this.request<any>(`/interviews/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({
        question_id: questionId,
        answer_text: answerText,
        time_taken_seconds: timeTaken,
      }),
    });
  }

  async getInterviewEvaluation(sessionId: string) {
    return this.request<any>(`/interviews/${sessionId}/evaluation`);
  }

  async transcribeAudio(audioBlob: Blob, filename = 'recording.webm') {
    const formData = new FormData();
    formData.append('file', audioBlob, filename);
    return this.request<{ text: string; model: string; provider: string }>('/interviews/transcribe', {
      method: 'POST',
      body: formData,
    });
  }

  // Roadmap
  async getRoadmap() {
    return this.request<any>('/roadmap/');
  }

  async updateRoadmapTask(taskId: string, updateData: any) {
    return this.request<any>(`/roadmap/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  // Analytics
  async getDashboardStats() {
    return this.request<any>('/analytics/dashboard');
  }

  // Diagnostics
  async getDiagnostics() {
    return this.request<any>('/diagnostics/ai-status');
  }

  async testGroqConnection(groq_api_key?: string, groq_model?: string) {
    return this.request<{
      success: boolean;
      message?: string;
      error?: string;
      latency_ms?: number;
      model?: string;
      available_models: string[];
    }>('/diagnostics/test-groq', {
      method: 'POST',
      body: JSON.stringify({ groq_api_key, groq_model }),
    });
  }

  async updateGroqConfig(groq_api_key: string, groq_model?: string, groq_stt_model?: string) {
    return this.request<any>('/diagnostics/groq-config', {
      method: 'POST',
      body: JSON.stringify({ groq_api_key, groq_model, groq_stt_model }),
    });
  }

  async clearGroqConfig() {
    return this.request<any>('/diagnostics/groq-config/clear', {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
