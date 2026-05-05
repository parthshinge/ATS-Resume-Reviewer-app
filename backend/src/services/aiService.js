const OpenAI = require('openai');
const {
  createResumeAnalysisPrompt,
  createResumeRewritePrompt,
  createCoverLetterPrompt,
  createInterviewQuestionsPrompt
} = require('../utils/aiPrompts');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze resume with AI
 * @param {string} resumeText - Extracted resume text
 * @param {string} jobDescription - Optional job description
 * @returns {Promise<Object>} - Analysis results
 */
async function analyzeResume(resumeText, jobDescription = '') {
  try {
    const prompt = createResumeAnalysisPrompt(resumeText, jobDescription);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert ATS and resume optimization specialist. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const analysis = JSON.parse(content);
    
    // Add metadata
    analysis._meta = {
      timestamp: new Date().toISOString(),
      model: 'gpt-4o',
      hasJobDescription: !!jobDescription
    };

    return analysis;
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw new Error(`Failed to analyze resume: ${error.message}`);
  }
}

/**
 * Rewrite resume with AI
 * @param {string} resumeText - Original resume text
 * @param {string} jobDescription - Optional job description
 * @returns {Promise<Object>} - Rewritten resume
 */
async function rewriteResume(resumeText, jobDescription = '') {
  try {
    const prompt = createResumeRewritePrompt(resumeText, jobDescription);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert resume writer. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('AI Rewrite Error:', error);
    throw new Error(`Failed to rewrite resume: ${error.message}`);
  }
}

/**
 * Generate cover letter
 * @param {string} resumeText - Resume content
 * @param {string} jobDescription - Job description
 * @param {string} companyName - Company name
 * @param {string} roleTitle - Role title
 * @returns {Promise<Object>} - Cover letter content
 */
async function generateCoverLetter(resumeText, jobDescription, companyName, roleTitle) {
  try {
    const prompt = createCoverLetterPrompt(resumeText, jobDescription, companyName, roleTitle);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert cover letter writer. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Cover Letter Error:', error);
    throw new Error(`Failed to generate cover letter: ${error.message}`);
  }
}

/**
 * Generate interview questions
 * @param {string} resumeText - Resume content
 * @param {string} jobDescription - Optional job description
 * @returns {Promise<Object>} - Interview preparation content
 */
async function generateInterviewQuestions(resumeText, jobDescription = '') {
  try {
    const prompt = createInterviewQuestionsPrompt(resumeText, jobDescription);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an interview preparation expert. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Interview Questions Error:', error);
    throw new Error(`Failed to generate interview questions: ${error.message}`);
  }
}

/**
 * Validate analysis output structure
 * @param {Object} analysis - AI analysis result
 * @returns {boolean} - Is valid
 */
function validateAnalysis(analysis) {
  const requiredFields = ['ats_score', 'summary', 'verdict'];
  return requiredFields.every(field => field in analysis);
}

module.exports = {
  analyzeResume,
  rewriteResume,
  generateCoverLetter,
  generateInterviewQuestions,
  validateAnalysis
};
