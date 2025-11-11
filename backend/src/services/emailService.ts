import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import { IEvaluation } from '../models/Evaluation';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Send evaluation results email
 */
export const sendResultsEmail = async (
  evaluation: IEvaluation,
  pdfBuffer?: Buffer
): Promise<void> => {
  try {
    const transporter = createTransporter();

    const categoryMessages = {
      strong_candidate: 'You are a strong candidate! 🌟',
      moderate_fit: 'You have good potential for this visa.',
      consider_alternatives: 'You may want to explore alternative options.',
      not_recommended: 'This visa may not be the best fit at this time.'
    };

    const categoryColors = {
      strong_candidate: '#10b981',
      moderate_fit: '#3b82f6',
      consider_alternatives: '#f59e0b',
      not_recommended: '#ef4444'
    };

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .score-box {
      background: white;
      border-left: 4px solid ${categoryColors[evaluation.scoreCategory]};
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .score {
      font-size: 48px;
      font-weight: bold;
      color: ${categoryColors[evaluation.scoreCategory]};
      margin: 0;
    }
    .category {
      color: ${categoryColors[evaluation.scoreCategory]};
      font-weight: bold;
      font-size: 18px;
    }
    .section {
      background: white;
      padding: 20px;
      margin: 15px 0;
      border-radius: 5px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .section h3 {
      margin-top: 0;
      color: #667eea;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin: 8px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #667eea;
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Your Visa Evaluation Results</h1>
    <p>For ${evaluation.visaType} in ${evaluation.targetCountry}</p>
  </div>

  <div class="content">
    <p>Dear ${evaluation.firstName},</p>

    <p>Your visa evaluation has been completed. Here are your results:</p>

    <div class="score-box">
      <p class="score">${evaluation.score}/100</p>
      <p class="category">${categoryMessages[evaluation.scoreCategory]}</p>
    </div>

    <div class="section">
      <h3>Summary</h3>
      <p>${evaluation.summary || 'Your profile has been evaluated against the requirements for this visa type.'}</p>
    </div>

    ${evaluation.strengths && evaluation.strengths.length > 0 ? `
    <div class="section">
      <h3>✅ Key Strengths</h3>
      <ul>
        ${evaluation.strengths.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    ${evaluation.improvements && evaluation.improvements.length > 0 ? `
    <div class="section">
      <h3>📈 Areas for Improvement</h3>
      <ul>
        ${evaluation.improvements.map(i => `<li>${i}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    ${evaluation.nextSteps && evaluation.nextSteps.length > 0 ? `
    <div class="section">
      <h3>🎯 Next Steps</h3>
      <ul>
        ${evaluation.nextSteps.map(n => `<li>${n}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <div class="section">
      <p><strong>Evaluation ID:</strong> ${evaluation._id}</p>
      <p><strong>Date:</strong> ${new Date(evaluation.evaluatedAt || evaluation.createdAt).toLocaleDateString()}</p>
    </div>

    <div class="footer">
      <p>This evaluation is for informational purposes only and does not guarantee visa approval.</p>
      <p>For official guidance, please consult with an immigration attorney.</p>
      <p><small>Visa Evaluation Tool © 2025</small></p>
    </div>
  </div>
</body>
</html>
    `;

    const mailOptions: any = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: evaluation.email,
      subject: `Your ${evaluation.visaType} Evaluation Results - Score: ${evaluation.score}/100`,
      html: htmlContent
    };

    // Attach PDF if provided
    if (pdfBuffer) {
      mailOptions.attachments = [
        {
          filename: `visa_evaluation_${evaluation._id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ];
    }

    await transporter.sendMail(mailOptions);

    logger.info(`Results email sent successfully to ${evaluation.email}`);
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send welcome email to new partner
 */
export const sendPartnerWelcomeEmail = async (
  email: string,
  partnerName: string,
  apiKey: string
): Promise<void> => {
  try {
    const transporter = createTransporter();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #667eea; color: white; padding: 20px; border-radius: 5px; }
    .content { padding: 20px; background: #f9fafb; margin-top: 20px; border-radius: 5px; }
    .api-key { background: #1f2937; color: #10b981; padding: 15px; border-radius: 5px; font-family: monospace; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Visa Evaluation API</h1>
    </div>
    <div class="content">
      <p>Hello ${partnerName},</p>
      <p>Your partner account has been created successfully! Here are your API credentials:</p>

      <h3>Your API Key:</h3>
      <div class="api-key">${apiKey}</div>

      <div class="warning">
        <strong>⚠️ Important:</strong> Keep this API key secure and never share it publicly.
        Store it in your environment variables.
      </div>

      <h3>Getting Started:</h3>
      <p>Include your API key in the request header:</p>
      <code>x-api-key: ${apiKey}</code>

      <p>For API documentation, visit our developer portal.</p>

      <p>Best regards,<br>Visa Evaluation Team</p>
    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Visa Evaluation API - Your API Key',
      html: htmlContent
    });

    logger.info(`Welcome email sent to partner: ${email}`);
  } catch (error) {
    logger.error('Failed to send partner welcome email:', error);
    throw error;
  }
};
