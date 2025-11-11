# Quick Setup Guide - O-1A Visa Evaluation Improvements

## Prerequisites

- Node.js 16+ installed
- MongoDB running
- OpenAI API account with credits

## Installation Steps

### 1. Install New Dependencies

```bash
cd backend
npm install pdf-parse mammoth openai
```

### 2. Configure OpenAI API Key

Edit your `backend/.env` file and add:

```env
# AI Integration (REQUIRED for new features)
OPENAI_API_KEY=sk-your-actual-key-here
```

**Get your API key**: https://platform.openai.com/api-keys

### 3. Verify Configuration

Check that your `.env` file includes all required variables:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/visa-evaluation

# Server
PORT=5001
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key

# Email (for sending results)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# AI Integration
OPENAI_API_KEY=sk-your-actual-key-here

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### 4. Start the Backend

```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 5001
MongoDB connected successfully
```

### 5. Start the Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
Local: http://localhost:5173
```

## Testing the Improvements

### Test 1: Basic Evaluation (Without AI)

If you want to test without OpenAI (fallback mode):

1. Comment out `OPENAI_API_KEY` in `.env`
2. Restart backend
3. Create evaluation - will use basic scoring
4. Check logs for: "AI evaluation failed, falling back to basic scoring"

### Test 2: Full AI Evaluation

1. Ensure `OPENAI_API_KEY` is configured
2. Navigate to http://localhost:5173
3. Fill out the form:
   - Name: Test User
   - Email: test@example.com
   - Location: New York, USA
   - Target Country: USA
   - Visa Type: O-1A Visa
   - Professional Summary: (paste a sample resume or description)
   - Upload Documents: Upload a PDF resume

4. Submit the form
5. Check backend logs for:
   ```
   Parsing X uploaded documents...
   Parsed resume.pdf: XXX words, success: true
   Using AI-powered evaluation...
   AI evaluation complete. Score: XX/100
   ```

6. View results page
7. Download PDF - should have new professional layout

### Test 3: Compare Scores

**Before (Old System)**:
- Typical candidate: 60-70/100 (inflated)
- Generic suggestions

**After (New System)**:
- Typical candidate: 8-25/100 (realistic)
- Specific recommendations based on 8 USCIS criteria
- Detailed evidence gaps

## Verifying the Fix

### Expected Score Ranges

For O-1A visa (extraordinary ability):

| Candidate Profile | Expected Score | Approval Likelihood |
|-------------------|----------------|---------------------|
| Entry-level (1-3 yrs) | 5-15 | Very Low |
| Mid-level (5-7 yrs) | 15-30 | Low |
| Senior (10+ yrs) | 25-45 | Low to Moderate |
| Exceptional (awards, publications, recognition) | 50-70 | Moderate to High |
| Truly Extraordinary (major awards, international recognition) | 70-90 | High to Very High |

### What to Look For

1. **Realistic Scores**: Most candidates should score 10-30, not 60-80
2. **Specific Feedback**: Recommendations mention actual USCIS criteria
3. **Evidence Analysis**: System identifies what's missing (e.g., "No evidence of major awards")
4. **Professional PDF**: Better spacing, visual bars, organized layout

## Common Issues

### Issue: "AI evaluation failed"

**Cause**: OpenAI API key issue

**Solution**:
1. Verify key is correct in `.env`
2. Check API key has credits: https://platform.openai.com/usage
3. Test key with curl:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

### Issue: "Document parsing failed"

**Cause**: Corrupted or encrypted file

**Solution**:
1. Try different PDF
2. Check file isn't password-protected
3. Verify file size < 10MB
4. Review logs for specific error

### Issue: Scores still seem high

**Cause**: Sample data might be very strong

**Solution**:
1. Test with basic/junior profile
2. Check logs for criteria analysis
3. Verify AI is being used (not fallback)
4. Review `reasoning` field in response

## Monitoring AI Usage

### Check OpenAI Dashboard

1. Visit https://platform.openai.com/usage
2. Monitor:
   - Daily API calls
   - Token usage
   - Costs

### Expected Usage Per Evaluation

- **Tokens**: ~4,000-8,000 total (input + output)
- **Cost**: $0.01-0.05 per evaluation
- **Time**: 5-15 seconds response time

### Cost Control

Set usage limits in OpenAI dashboard:
1. Go to Settings → Limits
2. Set monthly budget (e.g., $50/month)
3. Enable email alerts

## File Structure

New files created:

```
backend/src/
├── services/
│   ├── documentParsingService.ts    ← NEW: PDF/DOCX parsing
│   ├── aiAnalysisService.ts         ← NEW: OpenAI integration
│   ├── scoringServiceV2.ts          ← NEW: AI-powered scoring
│   └── pdfServiceV2.ts              ← NEW: Enhanced PDF layout
├── controllers/
│   └── evaluationController.ts      ← UPDATED: Uses new services
└── models/
    └── Evaluation.ts                ← UPDATED: New schema fields
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure OpenAI API key
3. ✅ Test evaluation flow
4. ✅ Verify realistic scores
5. ✅ Review PDF layout
6. ⏳ Deploy to staging
7. ⏳ A/B test with users
8. ⏳ Monitor costs and performance
9. ⏳ Collect feedback
10. ⏳ Deploy to production

## Support

If you encounter issues:

1. **Check Logs**: Look in backend console for errors
2. **Review Documentation**: See [IMPROVEMENTS.md](./IMPROVEMENTS.md)
3. **Test Fallback**: Disable AI to isolate issues
4. **OpenAI Status**: Check https://status.openai.com

## Summary

The system is now configured to:

✅ Parse actual document content (PDFs, DOCX)
✅ Use AI to analyze against official USCIS O-1A criteria
✅ Generate realistic scores (8-25% for typical candidates)
✅ Provide specific, evidence-based recommendations
✅ Create professional PDF reports with better layout

**Key Success Metric**: Your resume should now score realistically (8-15% range for typical candidate) instead of the inflated 68%.
