# Multi-Country Visa Evaluation Tool

A comprehensive full-stack application for evaluating visa eligibility across multiple countries (US, UK, Canada, Germany, Australia, Ireland, France, Netherlands, Poland, and more).

## 🎯 Features

- **Multi-Country Support**: Evaluate visa eligibility for 9+ countries
- **Intelligent Scoring**: AI-powered scoring based on experience, education, specialization, language, and documentation
- **Real-time Evaluation**: Get instant feedback on your visa application potential
- **PDF Reports**: Download professional evaluation reports
- **Email Delivery**: Receive results via email with PDF attachment
- **Beautiful UI**: Modern React frontend with shadcn/ui components
- **Robust Backend**: TypeScript/Express API with MongoDB

## 📁 Project Structure

```
openspehere/
├── frontend/          # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route pages
│   │   ├── utils/         # API utilities
│   │   └── hooks/         # Custom hooks
│   └── package.json
├── backend/           # Express + TypeScript backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # MongoDB models
│   │   ├── services/      # Business logic
│   │   └── routes/        # API routes
│   └── package.json
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** 6+ (local or Atlas)
- **Email Account** (Gmail recommended for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd openspehere
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   cd ..
   ```

4. **Configure Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your settings:
   # - MongoDB connection string
   # - Email credentials (Gmail)
   # - API keys, etc.
   ```

5. **Configure Frontend**
   ```bash
   cd ../frontend
   cp .env.example .env
   # Verify VITE_API_BASE_URL=http://localhost:5000/api
   ```

6. **Seed Database**
   ```bash
   cd ../backend
   npm run seed
   ```

### Running the Application

**Option 1: Run both servers separately**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:8080
```

**Option 2: Use the startup script (Windows)**

From the root directory:
```bash
./start.bat
```

**Option 3: Use the startup script (Mac/Linux)**

From the root directory:
```bash
chmod +x start.sh
./start.sh
```

### Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## 🔧 Configuration

### Backend Configuration (.env)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/visa_evaluation
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ALLOWED_ORIGINS=http://localhost:8080
```

### Frontend Configuration (.env)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 📱 Usage

### User Flow

1. **Home Page** - Learn about the visa evaluation tool
2. **Start Evaluation** - Click "Get Started"
3. **Step 1: Personal Information** - Enter your details
4. **Step 2: Country & Visa** - Select target country and visa type
5. **Step 3: Documents** - Upload required documents
6. **Step 4: Review** - Review and submit
7. **Results** - View your score, strengths, improvements, and next steps
8. **Actions** - Download PDF, email results, or start new evaluation

### API Endpoints

See `backend/README.md` for comprehensive API documentation.

Key endpoints:
- `GET /api/countries` - Get all countries with visa types
- `POST /api/evaluations` - Submit evaluation
- `GET /api/evaluations/:id` - Get evaluation results
- `GET /api/evaluations/:id/download-pdf` - Download PDF report
- `POST /api/evaluations/:id/email-results` - Email results

## 🧮 Scoring Algorithm

The evaluation score (0-100) is calculated based on:

1. **Experience** (30%) - Years of professional experience
2. **Education** (25%) - Degree level (HS, Bachelor, Master, PhD)
3. **Specialization** (20%) - Field match with visa requirements
4. **Language** (15%) - Proficiency level (A1-C2)
5. **Documents** (10%) - Completeness and quality

Each visa type has a configurable maximum score cap (typically 75-88).

### Score Categories

- **75-100**: Strong Candidate 🌟
- **60-74**: Moderate Fit ✓
- **40-59**: Consider Alternatives ⚠️
- **0-39**: Not Recommended ✗

## 🌍 Supported Countries

- 🇺🇸 United States (O-1A, H-1B)
- 🇬🇧 United Kingdom (Skilled Worker)
- 🇨🇦 Canada (Express Entry)
- 🇩🇪 Germany (EU Blue Card, Skilled Worker)
- 🇦🇺 Australia (Skilled Independent)
- 🇮🇪 Ireland (Critical Skills)
- 🇫🇷 France (Talent Passport)
- 🇳🇱 Netherlands (Highly Skilled Migrant)
- 🇵🇱 Poland (Work Permit)

## 📧 Email Configuration

For development, use Gmail with an App Password:

1. Enable 2FA on your Gmail account
2. Go to Google Account → Security → App passwords
3. Generate an app password for "Mail"
4. Use this password in `backend/.env` as `EMAIL_PASSWORD`

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing

Use the included Postman collection or test with cURL:

```bash
# Health check
curl http://localhost:5000/health

# Get countries
curl http://localhost:5000/api/countries

# Submit evaluation (example with files)
curl -X POST http://localhost:5000/api/evaluations \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "email=john@example.com" \
  -F "currentLocation=New York" \
  -F "professionalSummary=Software engineer with 8 years..." \
  -F "targetCountry=United States" \
  -F "visaType=O-1A Visa" \
  -F "visaTypeId=o1a" \
  -F "documents=@resume.pdf"
```

## 🚀 Deployment

### Backend Deployment

Recommended platforms:
- **Render.com** - Easy deployment with free tier
- **Railway.app** - Great for full-stack apps
- **Vercel** - Serverless deployment
- **Heroku** - Traditional platform

See `backend/README.md` for detailed deployment instructions.

### Frontend Deployment

Recommended platforms:
- **Vercel** - Optimized for React
- **Netlify** - Easy static hosting
- **Cloudflare Pages** - Fast global CDN

Build command:
```bash
npm run build
```

Output directory: `dist/`

### Environment Variables

Make sure to set all environment variables on your hosting platform:

**Backend**:
- `NODE_ENV=production`
- `MONGODB_URI` (your Atlas connection string)
- `EMAIL_USER`, `EMAIL_PASSWORD`
- `ALLOWED_ORIGINS` (your frontend URL)

**Frontend**:
- `VITE_API_BASE_URL` (your backend API URL)

## 🔐 Security

- Input validation with Zod
- File upload restrictions (10MB, PDF/DOC/images only)
- CORS protection
- API key authentication for partners
- Environment variable protection
- MongoDB injection prevention

## 🛠️ Development

### Code Style

- TypeScript for type safety
- ESLint for linting
- Prettier for formatting

### Project Commands

**Backend**:
```bash
npm run dev      # Development server
npm run build    # Build for production
npm start        # Run production build
npm run seed     # Seed database
npm test         # Run tests
```

**Frontend**:
```bash
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint code
```

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@visatool.com

## 🎯 Roadmap

- [ ] Add more countries and visa types
- [ ] Implement AI-powered summary generation
- [ ] Add user authentication
- [ ] Implement partner dashboard
- [ ] Add multilingual support
- [ ] Mobile app (React Native)
- [ ] Real-time chat support
- [ ] Integration with immigration lawyers

---

**Built with ❤️ for immigration transparency**
