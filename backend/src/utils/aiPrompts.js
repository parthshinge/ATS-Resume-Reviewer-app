/**
 * AI Prompts for Resume Analysis
 * Structured prompts for OpenAI API
 */

const ANALYSIS_SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) and resume optimization specialist with 15+ years of experience in technical recruiting at top companies like Google, Amazon, and Microsoft.

Your task is to analyze resumes and provide detailed, actionable feedback. Be thorough, professional, and specific in your recommendations.

Key areas to focus on:
1. ATS compatibility and formatting
2. Keyword optimization for the specific job description
3. Impact-driven bullet points with metrics
4. Skills gap analysis
5. Section improvements

Output must be in the exact JSON format specified.`;

function createResumeAnalysisPrompt(resumeText, jobDescription = '') {
  const jdContext = jobDescription 
    ? `\n\nJOB DESCRIPTION:\n${jobDescription}\n\nAnalyze how well the resume matches this specific job description.`
    : '\n\nAnalyze the resume for general ATS optimization and professional standards.';

  return `${ANALYSIS_SYSTEM_PROMPT}

RESUME TEXT:
${resumeText}
${jdContext}

Provide your analysis in the following strict JSON format:

{
  "ats_score": {
    "overall": 75,
    "formatting": 80,
    "keywords": 70,
    "readability": 75
  },
  "jd_match": {
    "percentage": 65,
    "matching_keywords": ["keyword1", "keyword2"],
    "missing_keywords": ["missing1", "missing2"],
    "match_details": "Brief explanation of match analysis"
  },
  "issues": [
    {
      "severity": "high|medium|low",
      "category": "formatting|content|keywords|grammar",
      "description": "Specific issue description",
      "location": "Section where issue was found"
    }
  ],
  "rewritten_bullets": [
    {
      "original": "Original bullet point text",
      "improved": "Improved bullet with metrics and action verbs",
      "section": "experience|projects|skills",
      "reason": "Why this improvement helps"
    }
  ],
  "skills_gap": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "recommended_courses": [
      {
        "skill": "Skill name",
        "platform": "Coursera/Udemy/etc",
        "course": "Specific course name"
      }
    ]
  },
  "section_improvements": {
    "summary": ["Improvement 1", "Improvement 2"],
    "experience": ["Improvement 1", "Improvement 2"],
    "education": ["Improvement 1", "Improvement 2"],
    "skills": ["Improvement 1", "Improvement 2"],
    "projects": ["Improvement 1", "Improvement 2"]
  },
  "summary": "Overall assessment of the resume (2-3 sentences)",
  "verdict": "strong|moderate|weak - Overall recommendation",
  "top_priorities": [
    "Priority 1 action item",
    "Priority 2 action item",
    "Priority 3 action item"
  ]
}

Important:
- Be honest but constructive
- Provide specific, actionable feedback
- Include metrics in rewritten bullets where possible
- Focus on ATS optimization
- Consider industry standards`;
}

function createResumeRewritePrompt(resumeText, jobDescription = '') {
  const jdContext = jobDescription 
    ? ` tailored for the provided job description`
    : '';

  return `${ANALYSIS_SYSTEM_PROMPT}

RESUME TEXT:
${resumeText}

Rewrite this resume${jdContext} to maximize ATS compatibility and impact. 

Provide output in this JSON format:

{
  "rewritten_resume": {
    "summary": "Professional summary (2-3 sentences)",
    "experience": [
      {
        "company": "Company Name",
        "title": "Job Title",
        "duration": "Dates",
        "bullets": ["Bullet 1", "Bullet 2", "Bullet 3"]
      }
    ],
    "skills": {
      "technical": ["Skill 1", "Skill 2"],
      "soft": ["Skill 1", "Skill 2"],
      "tools": ["Tool 1", "Tool 2"]
    },
    "projects": [
      {
        "name": "Project Name",
        "description": "Brief description",
        "technologies": ["Tech 1", "Tech 2"]
      }
    ],
    "education": {
      "degree": "Degree Name",
      "school": "School Name",
      "year": "Year"
    }
  },
  "changes_made": [
    "Description of major change 1",
    "Description of major change 2"
  ],
  "keywords_added": ["keyword1", "keyword2"],
  "formatting_notes": "Notes on ATS-friendly formatting"
}`;
}

function createCoverLetterPrompt(resumeText, jobDescription, companyName, roleTitle) {
  return `${ANALYSIS_SYSTEM_PROMPT}

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

COMPANY: ${companyName}
ROLE: ${roleTitle}

Write a compelling, personalized cover letter based on the resume and job description.

Output format:
{
  "cover_letter": {
    "greeting": "Dear Hiring Manager,",
    "opening": "Engaging opening paragraph connecting candidate's background to role",
    "body_paragraphs": [
      "Paragraph highlighting relevant experience",
      "Paragraph showcasing key achievements and skills match",
      "Paragraph demonstrating company knowledge and enthusiasm"
    ],
    "closing": "Strong call to action",
    "sign_off": "Sincerely,\\n[Candidate Name]"
  },
  "key_points_covered": [
    "Point 1 that was emphasized",
    "Point 2 that was emphasized"
  ],
  "customization_tips": [
    "Tip for further personalization",
    "Another customization suggestion"
  ]
}`;
}

function createInterviewQuestionsPrompt(resumeText, jobDescription = '') {
  const context = jobDescription 
    ? ` for a role with this description: ${jobDescription}`
    : '';

  return `Based on this resume${context}, generate likely interview questions and suggested answers.

RESUME:
${resumeText}

Output format:
{
  "technical_questions": [
    {
      "question": "Technical question based on skills/experience",
      "category": "coding|system_design|domain_specific",
      "suggested_answer": "Key points to cover in answer",
      "preparation_tips": "How to prepare for this"
    }
  ],
  "behavioral_questions": [
    {
      "question": "STAR format behavioral question",
      "category": "leadership|conflict|achievement|teamwork",
      "suggested_answer": "Framework for answering with resume details",
      "story_from_resume": "Which experience to reference"
    }
  ],
  "resume_deep_dive": [
    {
      "topic": "Specific project or experience to explain",
      "likely_question": "What they might ask about this",
      "preparation": "How to explain this convincingly"
    }
  ],
  "questions_to_ask": [
    "Smart question to ask the interviewer",
    "Another insightful question"
  ]
}`;
}

module.exports = {
  createResumeAnalysisPrompt,
  createResumeRewritePrompt,
  createCoverLetterPrompt,
  createInterviewQuestionsPrompt
};
