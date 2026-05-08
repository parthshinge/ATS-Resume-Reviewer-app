import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Upload API
export const uploadResume = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Payment API
export const createPayment = async (sessionId: string) => {
  const response = await api.post('/payment/create', { sessionId });
  return response.data;
};

export const verifyPayment = async (sessionId: string, paymentId: string) => {
  const response = await api.post('/payment/verify', { sessionId, paymentId });
  return response.data;
};

export const getPaymentStatus = async (sessionId: string) => {
  const response = await api.get(`/payment/status/${sessionId}`);
  return response.data;
};

// Analysis API
export const analyzeResume = async (sessionId: string, jobDescription?: string) => {
  const response = await api.post('/analyze', { sessionId, jobDescription });
  return response.data;
};

export const rewriteResume = async (sessionId: string, jobDescription?: string) => {
  const response = await api.post('/analyze/rewrite', { sessionId, jobDescription });
  return response.data;
};

export const generateCoverLetter = async (
  sessionId: string,
  companyName: string,
  roleTitle: string,
  jobDescription?: string
) => {
  const response = await api.post('/analyze/cover-letter', {
    sessionId,
    companyName,
    roleTitle,
    jobDescription,
  });
  return response.data;
};

export const generateInterviewPrep = async (sessionId: string, jobDescription?: string) => {
  const response = await api.post('/analyze/interview-prep', { sessionId, jobDescription });
  return response.data;
};

// Report API
export const downloadReport = async (sessionId: string): Promise<Blob> => {
  const response = await api.get(`/report/download/${sessionId}`, {
    responseType: 'blob',
  });
  return response.data;
};

// Types
export interface UploadResponse {
  success: boolean;
  sessionId: string;
  fileName: string;
  fileSize: number;
  textLength: number;
  message: string;
}

export interface AnalysisResult {
  ats_score: {
    overall: number;
    formatting: number;
    keywords: number;
    readability: number;
  };
  jd_match: {
    percentage: number;
    matching_keywords: string[];
    missing_keywords: string[];
    match_details: string;
  };
  issues: Array<{
    severity: 'high' | 'medium' | 'low';
    category: string;
    description: string;
    location?: string;
  }>;
  rewritten_bullets: Array<{
    original: string;
    improved: string;
    section: string;
    reason: string;
  }>;
  skills_gap: {
    technical: string[];
    soft: string[];
    recommended_courses: Array<{
      skill: string;
      platform: string;
      course: string;
    }>;
  };
  section_improvements: {
    summary: string[];
    experience: string[];
    education: string[];
    skills: string[];
    projects: string[];
  };
  summary: string;
  verdict: 'strong' | 'moderate' | 'weak';
  top_priorities: string[];
  _meta?: {
    timestamp: string;
    model: string;
    hasJobDescription: boolean;
  };
}

export default api;
