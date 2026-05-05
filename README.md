# ResumeX - Private AI Resume Reviewer

A production-ready, pay-per-use AI resume analysis application with privacy-first design. No login required. Powered by OpenAI GPT-4 and Base Blockchain payments.

## 🎯 Features

- **ATS Optimization**: Get scored against major ATS systems
- **AI-Powered Analysis**: GPT-4 provides professional-grade feedback
- **Privacy First**: No account needed, auto-deleted after 30 minutes
- **Job Match Scoring**: Compare against job descriptions
- **Pay Per Use**: Just $2 per analysis via Base blockchain
- **PDF Report**: Download detailed analysis reports

## 🏗️ Architecture

```
resumex/
├── frontend/          # Next.js 14 + Tailwind + ShadCN UI
│   ├── app/          # App Router
│   ├── components/   # React components
│   └── lib/         # Utilities & API
├── backend/         # Express.js API
│   ├── src/
│   │   ├── routes/  # API endpoints
│   │   ├── services/# AI & payment logic
│   │   └── utils/   # Helpers
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- OpenAI API key
- b402 SDK API key (for payments)
- Base wallet address (for receiving payments)

### Backend Setup

```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your keys:
# - OPENAI_API_KEY
# - B402_API_KEY
# - PAYMENT_RECIPIENT_ADDRESS

npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local:
# - NEXT_PUBLIC_API_URL=http://localhost:3001

npm run dev
```

### Access the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload resume (PDF/DOCX) |
| POST | `/api/payment/create` | Create payment request |
| POST | `/api/payment/verify` | Verify payment |
| POST | `/api/analyze` | Analyze resume |
| POST | `/api/analyze/rewrite` | Rewrite resume |
| POST | `/api/analyze/cover-letter` | Generate cover letter |
| POST | `/api/analyze/interview-prep` | Interview questions |
| GET | `/api/report/download/:sessionId` | Download PDF report |

## 🔐 Environment Variables

### Backend (.env)

```env
PORT=3001
NODE_ENV=development

# OpenAI
OPENAI_API_KEY=sk-...

# Base Blockchain
BASE_RPC_URL=https://mainnet.base.org
BASE_CHAIN_ID=8453

# b402 SDK
B402_API_KEY=your-b402-api-key
B402_WEBHOOK_SECRET=your-webhook-secret

# Payment Settings
PAYMENT_AMOUNT_USD=2
PAYMENT_RECIPIENT_ADDRESS=your-base-wallet-address

# Security
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=ResumeX
NEXT_PUBLIC_PAYMENT_AMOUNT=2
```

## 🧠 AI Analysis Output

The AI returns structured JSON with:

- `ats_score`: Overall ATS compatibility (0-100)
- `jd_match`: Job description match percentage
- `issues`: Array of identified issues with severity
- `rewritten_bullets`: Suggested bullet point improvements
- `skills_gap`: Missing technical and soft skills
- `section_improvements`: Per-section recommendations
- `verdict`: Overall assessment (strong/moderate/weak)

## 💳 Payment Flow

1. User uploads resume → Gets session ID
2. Create payment → b402 generates checkout URL
3. User pays with crypto (ETH/USDC/USDT on Base)
4. Verify payment → Unlock analysis
5. AI processes resume → Return results

## 📊 Project Structure

### Frontend Components

- `Hero`: Landing page with CTA
- `UploadSection`: Drag & drop file upload
- `PaymentSection`: Crypto payment UI
- `JobDescriptionSection`: Optional JD input
- `AnalysisResults`: Results dashboard with tabs
- `Features`: Feature grid

### Backend Services

- `aiService`: OpenAI GPT-4 integration
- `paymentService`: b402 SDK integration
- `reportService`: PDF report generation
- `fileParser`: PDF/DOCX text extraction

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- ShadCN UI
- Framer Motion

**Backend:**
- Express.js
- OpenAI API
- b402-sdk (Base blockchain)
- Puppeteer (PDF generation)
- Multer (file uploads)

## 📝 Development Notes

### Privacy Features

- No database storage (in-memory only)
- Auto-cleanup after 30 minutes
- Files never leave the server permanently
- No user tracking or analytics

### Payment Testing

In development mode, payments auto-verify without actual blockchain interaction. Set `NODE_ENV=production` for real payments.

### File Upload Limits

- Max file size: 10MB
- Supported formats: PDF, DOCX, DOC
- Text extraction: pdf-parse, mammoth

## 🚢 Deployment

### Backend (e.g., Railway/Render/Heroku)

```bash
# Set environment variables in dashboard
git push origin main
```

### Frontend (e.g., Vercel/Netlify)

```bash
# Build command
npm run build

# Output directory
.next
```

## 📄 License

MIT License - See LICENSE file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For support, email support@resumex.dev or open an issue.

---

Built with ❤️ using Next.js, Express, and OpenAI GPT-4.
