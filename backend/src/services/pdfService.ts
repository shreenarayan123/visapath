import PDFDocument from 'pdfkit';
import { IEvaluation } from '../models/Evaluation';

/**
 * Generate PDF report for evaluation
 */
export const generateEvaluationPDF = async (evaluation: IEvaluation): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Header
      doc
        .fontSize(24)
        .fillColor('#667eea')
        .text('Visa Evaluation Report', { align: 'center' });

      doc.moveDown();

      // User Information
      doc
        .fontSize(16)
        .fillColor('#333')
        .text('Applicant Information', { underline: true });

      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text(`Name: ${evaluation.firstName} ${evaluation.lastName}`);
      doc.text(`Email: ${evaluation.email}`);
      if (evaluation.phone) {
        doc.text(`Phone: ${evaluation.phone}`);
      }
      doc.text(`Current Location: ${evaluation.currentLocation}`);

      doc.moveDown();

      // Visa Information
      doc.fontSize(16).fillColor('#333').text('Visa Information', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text(`Target Country: ${evaluation.targetCountry}`);
      doc.text(`Visa Type: ${evaluation.visaType}`);
      doc.text(`Evaluation Date: ${new Date(evaluation.evaluatedAt || evaluation.createdAt).toLocaleDateString()}`);

      doc.moveDown();

      // Score
      doc.fontSize(16).fillColor('#333').text('Evaluation Score', { underline: true });
      doc.moveDown(0.5);

      // Draw score box
      const scoreColor = getScoreColor(evaluation.scoreCategory);
      doc
        .fontSize(48)
        .fillColor(scoreColor)
        .text(`${evaluation.score}/100`, { align: 'center' });

      doc.moveDown(0.5);
      doc
        .fontSize(14)
        .fillColor('#666')
        .text(getCategoryLabel(evaluation.scoreCategory), { align: 'center' });

      doc.moveDown();

      // Summary
      if (evaluation.summary) {
        doc.fontSize(16).fillColor('#333').text('Summary', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#444').text(evaluation.summary, { align: 'justify' });
        doc.moveDown();
      }

      // Score Breakdown
      if (evaluation.scoreBreakdown) {
        doc.fontSize(16).fillColor('#333').text('Score Breakdown', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);

        const breakdown = evaluation.scoreBreakdown;
        doc.text(`• Experience: ${breakdown.experience}/100`);
        doc.text(`• Education: ${breakdown.education}/100`);
        doc.text(`• Specialization: ${breakdown.specialization}/100`);
        doc.text(`• Language: ${breakdown.language}/100`);
        doc.text(`• Document Quality: ${breakdown.documentQuality}/100`);

        doc.moveDown();
      }

      // Strengths
      if (evaluation.strengths && evaluation.strengths.length > 0) {
        doc.fontSize(16).fillColor('#10b981').text('✓ Key Strengths', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#333');

        evaluation.strengths.forEach((strength) => {
          doc.text(`• ${strength}`, { indent: 20 });
        });

        doc.moveDown();
      }

      // Improvements
      if (evaluation.improvements && evaluation.improvements.length > 0) {
        doc.fontSize(16).fillColor('#f59e0b').text('↗ Areas for Improvement', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#333');

        evaluation.improvements.forEach((improvement) => {
          doc.text(`• ${improvement}`, { indent: 20 });
        });

        doc.moveDown();
      }

      // Next Steps
      if (evaluation.nextSteps && evaluation.nextSteps.length > 0) {
        doc.fontSize(16).fillColor('#3b82f6').text('→ Next Steps', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#333');

        evaluation.nextSteps.forEach((step) => {
          doc.text(`• ${step}`, { indent: 20 });
        });

        doc.moveDown();
      }

      // Reasoning
      if (evaluation.reasoning) {
        doc.addPage();
        doc.fontSize(16).fillColor('#333').text('Detailed Reasoning', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#444').text(evaluation.reasoning, { align: 'justify' });
        doc.moveDown();
      }

      // Uploaded Documents
      if (evaluation.uploadedDocuments && evaluation.uploadedDocuments.length > 0) {
        doc.fontSize(16).fillColor('#333').text('Uploaded Documents', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);

        evaluation.uploadedDocuments.forEach((document) => {
          doc.text(`• ${document.documentType}: ${document.fileName}`);
        });

        doc.moveDown();
      }

      // Footer
      doc.moveDown(2);
      doc
        .fontSize(9)
        .fillColor('#999')
        .text('This evaluation is for informational purposes only.', { align: 'center' });
      doc.text('Please consult with an immigration attorney for official guidance.', { align: 'center' });
      doc.moveDown(0.5);
      doc.text(`Evaluation ID: ${evaluation._id}`, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get color based on score category
 */
const getScoreColor = (category: string): string => {
  const colors: Record<string, string> = {
    strong_candidate: '#10b981',
    moderate_fit: '#3b82f6',
    consider_alternatives: '#f59e0b',
    not_recommended: '#ef4444'
  };

  return colors[category] || '#6b7280';
};

/**
 * Get human-readable category label
 */
const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    strong_candidate: 'Strong Candidate',
    moderate_fit: 'Moderate Fit',
    consider_alternatives: 'Consider Alternatives',
    not_recommended: 'Not Recommended'
  };

  return labels[category] || 'Evaluated';
};
