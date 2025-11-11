# Visa Evaluation Tool - Backend API

A comprehensive backend API for multi-country visa evaluation. This tool helps users assess their eligibility for various visa types across multiple countries including the US, UK, Canada, Germany, Australia, and more.

## 🚀 Features

- **Multi-Country Support**: Evaluate visa eligibility for 9+ countries
- **Intelligent Scoring**: Advanced algorithm evaluates candidates based on experience, education, specialization, language, and documentation
- **Document Upload**: Support for multiple file formats (PDF, DOC, DOCX, images)
- **Email Notifications**: Automated results delivery with PDF reports
- **Partner API**: White-label integration for immigration consultants
- **RESTful API**: Clean, well-documented endpoints
- **TypeScript**: Type-safe codebase
- **MongoDB**: Scalable database with proper indexing

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Scoring Algorithm](#scoring-algorithm)
- [Deployment](#deployment)
- [Testing](#testing)

## 🛠 Installation

### Prerequisites

- Node.js 18+ and npm
- MongoDB 6+ (local or Atlas)
- Email account (Gmail recommended for development)

### Steps

```bash
# Clone the repository
git clone <your-repo-url>
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/visa_evaluation
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/visa_evaluation

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@visatool.com

# Security
JWT_SECRET=your-super-secret-key
API_KEY_SALT=your-api-key-salt

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Logging
LOG_LEVEL=info
```

### Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account → Security → App passwords
3. Generate an app password for "Mail"
4. Use this password in `EMAIL_PASSWORD`

## 🗄️ Database Setup

### Seed Visa Types Data

```bash
# Seed the database with visa types for all countries
npm run seed
```

This will populate your database with visa information for:
- United States (O-1A, H-1B)
- United Kingdom (Skilled Worker)
- Canada (Express Entry)
- Germany (EU Blue Card)
- Australia (Skilled Independent)
- Ireland (Critical Skills)
- France (Talent Passport)
- Netherlands (Highly Skilled Migrant)
- Poland (Work Permit)

## 🏃 Running the Server

### Development Mode

```bash
npm run dev
```

Server will run on `http://localhost:5000` with hot-reload enabled.

### Production Mode

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 📚 API Endpoints

### Public Endpoints

#### Health Check
```http
GET /health
```

#### Get All Countries and Visa Types
```http
GET /api/countries
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "countryCode": "US",
      "countryName": "United States",
      "visaTypes": [...]
    }
  ]
}
```

#### Get Visa Types by Country
```http
GET /api/countries/:countryCode
```

Example: `GET /api/countries/US`

#### Get Specific Visa Type Details
```http
GET /api/countries/:countryCode/visa-types/:visaTypeId
```

Example: `GET /api/countries/US/visa-types/o1a`

#### Create Evaluation
```http
POST /api/evaluations
Content-Type: multipart/form-data
```

**Form Data:**
- `firstName` (required): String
- `lastName` (required): String
- `email` (required): String
- `phone` (optional): String
- `currentLocation` (required): String
- `professionalSummary` (required): String (min 50 characters)
- `targetCountry` (required): String
- `visaType` (required): String
- `visaTypeId` (required): String
- `documents[]` (optional): Multiple files (max 10, 10MB each)

**Response:**
```json
{
  "success": true,
  "data": {
    "evaluationId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "status": "completed",
    "score": 78,
    "scoreCategory": "strong_candidate"
  }
}
```

#### Get Evaluation Results
```http
GET /api/evaluations/:id
```

#### Email Results
```http
POST /api/evaluations/:id/email-results
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Download PDF Report
```http
GET /api/evaluations/:id/download-pdf
```

Returns PDF file for download.

### Partner Endpoints

All partner endpoints require `x-api-key` header.

#### Get Partner Evaluations
```http
GET /api/partner/evaluations
Headers: x-api-key: vsk_your_api_key_here

Query Parameters:
- limit (default: 20)
- offset (default: 0)
- country
- visaType
- scoreMin
- scoreMax
- dateFrom
- dateTo
- status
```

#### Get Partner Statistics
```http
GET /api/partner/stats
Headers: x-api-key: vsk_your_api_key_here
```

#### Export Evaluations (CSV)
```http
GET /api/partner/evaluations/export
Headers: x-api-key: vsk_your_api_key_here
```

#### Create Partner Account
```http
POST /api/partner/create
Content-Type: application/json

{
  "partnerName": "Acme Immigration",
  "email": "partner@acme.com",
  "companyWebsite": "https://acme.com",
  "allowedOrigins": ["https://acme.com", "https://app.acme.com"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "partnerId": "...",
    "apiKey": "vsk_abc123...",
    "message": "Partner created successfully"
  }
}
```

⚠️ **Important**: API key is only shown once during creation!

## 🧮 Scoring Algorithm

The evaluation score (0-100) is calculated based on:

### Components

1. **Experience (Weight varies by visa)**
   - Years of relevant work experience
   - Compared against visa minimum requirements
   - Penalty for not meeting minimum

2. **Education (Weight varies by visa)**
   - Education level: High School < Bachelor < Master < PhD
   - Bonus for exceeding requirements

3. **Specialization Match (Weight varies by visa)**
   - How well candidate's field matches visa requirements
   - Technology, Healthcare, Engineering, etc.

4. **Language Proficiency (Weight varies by visa)**
   - CEFR levels: A1, A2, B1, B2, C1, C2
   - Bonus for exceeding requirements

5. **Document Quality (Weight varies by visa)**
   - Completeness of submitted documents
   - Number and relevance of documents

### Score Categories

- **75-100**: Strong Candidate 🌟
- **60-74**: Moderate Fit ✓
- **40-59**: Consider Alternatives ⚠️
- **0-39**: Not Recommended ✗

### Max Score Cap

Each visa type has a configurable maximum score (typically 75-88) to reflect realistic success rates.

## 🚀 Deployment

### Recommended Platforms

#### 1. Render.com (Easiest)

```bash
# Create new Web Service on Render
# Connect your GitHub repo
# Set environment variables
# Deploy!
```

#### 2. Railway.app

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### 3. Vercel (Serverless)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Production Checklist

- [ ] Environment variables configured
- [ ] MongoDB Atlas connection string set
- [ ] Email service credentials configured
- [ ] CORS origins updated for production domain
- [ ] File uploads configured (S3 recommended for production)
- [ ] API key salt changed from default
- [ ] JWT secret changed from default
- [ ] Logging configured (consider Sentry)
- [ ] Database indexes created
- [ ] Backup strategy in place

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Test Coverage

```bash
npm test -- --coverage
```

### Manual API Testing

Use the provided Postman collection or cURL:

```bash
# Get all countries
curl http://localhost:5000/api/countries

# Create evaluation (simplified example)
curl -X POST http://localhost:5000/api/evaluations \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "email=john@example.com" \
  -F "currentLocation=New York" \
  -F "professionalSummary=Software engineer with 8 years of experience in machine learning and AI..." \
  -F "targetCountry=United States" \
  -F "visaType=O-1A Visa" \
  -F "visaTypeId=o1a" \
  -F "documents=@resume.pdf"
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   ├── evaluationController.ts
│   │   ├── visaController.ts
│   │   └── partnerController.ts
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── asyncHandler.ts
│   │   ├── validateApiKey.ts
│   │   └── upload.ts
│   ├── models/
│   │   ├── Evaluation.ts
│   │   ├── VisaType.ts
│   │   ├── Partner.ts
│   │   └── UserSubmission.ts
│   ├── routes/
│   │   ├── evaluationRoutes.ts
│   │   ├── visaRoutes.ts
│   │   ├── partnerRoutes.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── scoringService.ts
│   │   ├── emailService.ts
│   │   └── pdfService.ts
│   ├── scripts/
│   │   └── seedVisaTypes.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── ApiError.ts
│   │   └── crypto.ts
│   ├── validators/
│   │   └── evaluationValidator.ts
│   └── server.ts
├── uploads/
├── logs/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@visatool.com

## 🎯 Roadmap

- [ ] Add more countries and visa types
- [ ] Implement AI-powered summary generation (OpenAI/Claude)
- [ ] Add user authentication
- [ ] Implement rate limiting
- [ ] Add webhook support for partner integrations
- [ ] Create admin dashboard
- [ ] Add analytics and reporting
- [ ] Implement caching with Redis
- [ ] Add GraphQL API
- [ ] Multi-language support

---

Built with ❤️ for immigration transparency
