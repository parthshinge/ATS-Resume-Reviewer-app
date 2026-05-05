const puppeteer = require('puppeteer');
const sanitizeHtml = require('sanitize-html');

/**
 * Generate a professional PDF report from analysis data
 * @param {Object} analysis - Analysis result object
 * @param {string} fileName - Original resume file name
 * @returns {Promise<Buffer>} - PDF buffer
 */
async function generatePDFReport(analysis, fileName) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Generate HTML content
    const htmlContent = generateReportHTML(analysis, fileName);

    // Set content and generate PDF
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    return pdf;

  } finally {
    await browser.close();
  }
}

/**
 * Generate HTML for the report
 * @param {Object} analysis - Analysis data
 * @param {string} fileName - Original file name
 * @returns {string} - HTML string
 */
function generateReportHTML(analysis, fileName) {
  const {
    ats_score,
    jd_match,
    issues,
    rewritten_bullets,
    skills_gap,
    section_improvements,
    summary,
    verdict,
    top_priorities,
    _meta
  } = analysis;

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const verdictColor = verdict === 'strong' ? '#22c55e' : verdict === 'moderate' ? '#f59e0b' : '#ef4444';
  const verdictText = verdict === 'strong' ? 'Strong Candidate' : verdict === 'moderate' ? 'Moderate Match' : 'Needs Improvement';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ResumeX Analysis Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #ffffff;
    }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    .header {
      text-align: center;
      padding-bottom: 30px;
      border-bottom: 3px solid #6366f1;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #6366f1;
      font-size: 32px;
      margin-bottom: 10px;
    }
    .header .subtitle {
      color: #6b7280;
      font-size: 14px;
    }
    .summary-card {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .verdict-badge {
      display: inline-block;
      background: ${verdictColor};
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 15px;
    }
    .score-section {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .score-card {
      background: #f9fafb;
      padding: 20px;
      border-radius: 10px;
      border: 1px solid #e5e7eb;
    }
    .score-card h3 {
      color: #374151;
      font-size: 14px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .score-value {
      font-size: 36px;
      font-weight: 700;
      color: #6366f1;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      margin-top: 10px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      border-radius: 4px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      color: #1f2937;
      font-size: 20px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    .issue-item {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 0 8px 8px 0;
    }
    .issue-item.medium {
      background: #fffbeb;
      border-left-color: #f59e0b;
    }
    .issue-item.low {
      background: #eff6ff;
      border-left-color: #3b82f6;
    }
    .bullet-comparison {
      background: #f0fdf4;
      border-left: 4px solid #22c55e;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 0 8px 8px 0;
    }
    .bullet-comparison .original {
      color: #6b7280;
      font-style: italic;
      margin-bottom: 8px;
      text-decoration: line-through;
    }
    .bullet-comparison .improved {
      color: #15803d;
      font-weight: 500;
    }
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    .skill-tag {
      background: #fef3c7;
      color: #92400e;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
    }
    .priority-list {
      list-style: none;
    }
    .priority-list li {
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
      padding-left: 25px;
      position: relative;
    }
    .priority-list li:before {
      content: "▸";
      position: absolute;
      left: 0;
      color: #6366f1;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 12px;
    }
    .meta-info {
      text-align: right;
      color: #9ca3af;
      font-size: 11px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="meta-info">
      Generated on ${date} | Resume: ${sanitizeHtml(fileName || 'Unknown')}
    </div>

    <div class="header">
      <h1>ResumeX Analysis Report</h1>
      <p class="subtitle">Professional AI-Powered Resume Review</p>
    </div>

    <div class="summary-card">
      <div class="verdict-badge">${verdictText}</div>
      <p>${sanitizeHtml(summary || 'No summary available.')}</p>
    </div>

    <div class="score-section">
      <div class="score-card">
        <h3>ATS Score</h3>
        <div class="score-value">${ats_score?.overall || 0}%</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${ats_score?.overall || 0}%"></div>
        </div>
      </div>
      <div class="score-card">
        <h3>Job Match</h3>
        <div class="score-value">${jd_match?.percentage || 0}%</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${jd_match?.percentage || 0}%"></div>
        </div>
      </div>
    </div>

    ${issues && issues.length > 0 ? `
    <div class="section">
      <h2>Issues Found (${issues.length})</h2>
      ${issues.map(issue => `
        <div class="issue-item ${sanitizeHtml(issue.severity || 'medium')}">
          <strong>${sanitizeHtml(issue.category || 'General')}:</strong> ${sanitizeHtml(issue.description || '')}
          ${issue.location ? `<br><small>Location: ${sanitizeHtml(issue.location)}</small>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${rewritten_bullets && rewritten_bullets.length > 0 ? `
    <div class="section">
      <h2>Suggested Improvements (${rewritten_bullets.length})</h2>
      ${rewritten_bullets.map(bullet => `
        <div class="bullet-comparison">
          <div class="original">${sanitizeHtml(bullet.original || '')}</div>
          <div class="improved">${sanitizeHtml(bullet.improved || '')}</div>
          ${bullet.reason ? `<small style="color: #6b7280; display: block; margin-top: 8px;">${sanitizeHtml(bullet.reason)}</small>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${skills_gap?.technical?.length > 0 ? `
    <div class="section">
      <h2>Skills to Develop</h2>
      <div class="skills-grid">
        ${skills_gap.technical.map(skill => `
          <span class="skill-tag">${sanitizeHtml(skill)}</span>
        `).join('')}
      </div>
    </div>
    ` : ''}

    ${top_priorities && top_priorities.length > 0 ? `
    <div class="section">
      <h2>Top Priorities</h2>
      <ul class="priority-list">
        ${top_priorities.map(priority => `
          <li>${sanitizeHtml(priority)}</li>
        `).join('')}
      </ul>
    </div>
    ` : ''}

    <div class="footer">
      <p>Generated by ResumeX - Private AI Resume Reviewer</p>
      <p>This report is confidential and auto-generated.</p>
    </div>
  </div>
</body>
</html>
  `;
}

module.exports = {
  generatePDFReport
};
