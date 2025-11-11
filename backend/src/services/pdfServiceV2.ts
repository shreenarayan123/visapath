import PDFDocument from 'pdfkit';
import { IEvaluation } from '../models/Evaluation';

/**
 * IMPROVED PDF Generation Service
 * - Better spacing and visual hierarchy
 * - Professional layout with consistent margins
 * - Visual score breakdown with progress bars
 * - Enhanced O-1A specific formatting
 * - Better typography and readability
 */

const COLORS = {
  primary: '#667eea',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  text: {
    heading: '#1f2937',
    body: '#374151',
    muted: '#6b7280',
    light: '#9ca3af'
  },
  score: {
    strong: '#10b981',
    moderate: '#3b82f6',
    consider: '#f59e0b',
    notRecommended: '#ef4444'
  }
};

const SPACING = {
  section: 1.5,
  subsection: 1,
  paragraph: 0.7,
  item: 0.3
};

export const generateEvaluationPDF = async (evaluation: IEvaluation): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 60,
        size: 'LETTER',
        bufferPages: true
      });

      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // =========================
      // PAGE 1: HEADER & OVERVIEW
      // =========================

      // Header with logo area
      doc
        .fontSize(28)
        .font('Helvetica-Bold')
        .fillColor(COLORS.primary)
        .text('O-1A VISA EVALUATION REPORT', { align: 'center' });

      doc.moveDown(SPACING.subsection);

      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor(COLORS.text.muted)
        .text('Comprehensive Assessment Based on Official USCIS Criteria', { align: 'center' });

      doc.moveDown(SPACING.section);

      // Divider line
      drawHorizontalLine(doc, COLORS.primary);
      doc.moveDown(SPACING.section);

      // Applicant Information Box
      drawSectionBox(doc, 'APPLICANT INFORMATION', COLORS.info);
      doc.moveDown(SPACING.subsection);

      const infoLeft = 80;
      const infoTop = doc.y;

      doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.text.heading);
      doc.text('Full Name:', infoLeft, infoTop);
      doc.text('Email:', infoLeft, infoTop + 20);
      if (evaluation.phone) doc.text('Phone:', infoLeft, infoTop + 40);
      doc.text('Location:', infoLeft, infoTop + (evaluation.phone ? 60 : 40));
      doc.text('Target Country:', infoLeft, infoTop + (evaluation.phone ? 80 : 60));
      doc.text('Visa Type:', infoLeft, infoTop + (evaluation.phone ? 100 : 80));
      doc.text('Evaluation Date:', infoLeft, infoTop + (evaluation.phone ? 120 : 100));

      doc.fontSize(10).font('Helvetica').fillColor(COLORS.text.body);
      doc.text(`${evaluation.firstName} ${evaluation.lastName}`, infoLeft + 120, infoTop);
      doc.text(evaluation.email, infoLeft + 120, infoTop + 20);
      if (evaluation.phone) doc.text(evaluation.phone, infoLeft + 120, infoTop + 40);
      doc.text(evaluation.currentLocation, infoLeft + 120, infoTop + (evaluation.phone ? 60 : 40));
      doc.text(evaluation.targetCountry, infoLeft + 120, infoTop + (evaluation.phone ? 80 : 60));
      doc.text(evaluation.visaType, infoLeft + 120, infoTop + (evaluation.phone ? 100 : 80));
      doc.text(
        new Date(evaluation.evaluatedAt || evaluation.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        infoLeft + 120,
        infoTop + (evaluation.phone ? 120 : 100)
      );

      doc.y = infoTop + (evaluation.phone ? 150 : 130);
      doc.moveDown(SPACING.section);

      // =========================
      // SCORE DISPLAY - PROMINENT
      // =========================

      drawSectionBox(doc, 'OVERALL EVALUATION SCORE', COLORS.success);
      doc.moveDown(SPACING.section);

      // Large score display with background
      const scoreY = doc.y;
      const scoreColor = getScoreColor(evaluation.scoreCategory);

      // Draw circular background for score
      doc
        .circle(doc.page.width / 2, scoreY + 60, 70)
        .fillOpacity(0.1)
        .fillAndStroke(scoreColor, scoreColor)
        .fillOpacity(1);

      doc
        .fontSize(56)
        .font('Helvetica-Bold')
        .fillColor(scoreColor)
        .text(evaluation.score.toString(), 0, scoreY + 30, {
          align: 'center',
          width: doc.page.width
        });

      doc
        .fontSize(20)
        .font('Helvetica')
        .fillColor(COLORS.text.muted)
        .text('/100', 0, scoreY + 85, {
          align: 'center',
          width: doc.page.width
        });

      doc.y = scoreY + 140;
      doc.moveDown(SPACING.subsection);

      // Category label
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .fillColor(scoreColor)
        .text(getCategoryLabel(evaluation.scoreCategory), {
          align: 'center'
        });

      doc.moveDown(SPACING.section);

      // Approval likelihood indicator
      const likelihood = getApprovalLikelihood(evaluation.score);
      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor(COLORS.text.body)
        .text(`Approval Likelihood: ${likelihood}`, { align: 'center' });

      doc.moveDown(SPACING.section);
      drawHorizontalLine(doc, COLORS.text.light);
      doc.moveDown(SPACING.section);

      // =========================
      // EXECUTIVE SUMMARY
      // =========================

      if (evaluation.summary) {
        drawSectionHeader(doc, 'EXECUTIVE SUMMARY', COLORS.primary);
        doc.moveDown(SPACING.subsection);

        doc
          .fontSize(11)
          .font('Helvetica')
          .fillColor(COLORS.text.body)
          .text(evaluation.summary, {
            align: 'left',
            lineGap: 4
          });

        doc.moveDown(SPACING.section);
      }

      // =========================
      // PAGE 2: SCORE BREAKDOWN
      // =========================

      doc.addPage();

      drawSectionHeader(doc, 'DETAILED SCORE BREAKDOWN', COLORS.primary);
      doc.moveDown(SPACING.section);

      if (evaluation.scoreBreakdown) {
        const breakdown = evaluation.scoreBreakdown;

        // Standard criteria
        drawScoreBar(doc, 'Experience', breakdown.experience);
        doc.moveDown(SPACING.item);
        drawScoreBar(doc, 'Education', breakdown.education);
        doc.moveDown(SPACING.item);
        drawScoreBar(doc, 'Field Specialization', breakdown.specialization);
        doc.moveDown(SPACING.item);
        drawScoreBar(doc, 'Language Proficiency', breakdown.language);
        doc.moveDown(SPACING.item);
        drawScoreBar(doc, 'Documentation Quality', breakdown.documentQuality);

        // O-1A specific criteria
        if (breakdown.o1aCriteriaMet !== undefined) {
          doc.moveDown(SPACING.section);
          drawSectionBox(doc, 'O-1A SPECIFIC CRITERIA', COLORS.warning);
          doc.moveDown(SPACING.subsection);

          drawScoreBar(doc, 'USCIS Criteria Met (Need 3/8)', breakdown.o1aCriteriaMet);
          doc.moveDown(SPACING.item);

          if (breakdown.nationalRecognition !== undefined) {
            drawScoreBar(doc, 'National/International Recognition', breakdown.nationalRecognition);
            doc.moveDown(SPACING.item);
          }

          if (breakdown.originalContributions !== undefined) {
            drawScoreBar(doc, 'Original Contributions', breakdown.originalContributions);
          }
        }

        doc.moveDown(SPACING.section);
      }

      // =========================
      // KEY STRENGTHS
      // =========================

      if (evaluation.strengths && evaluation.strengths.length > 0) {
        drawSectionHeader(doc, '✓ KEY STRENGTHS', COLORS.success);
        doc.moveDown(SPACING.subsection);

        evaluation.strengths.forEach((strength, index) => {
          drawBulletPoint(doc, strength, COLORS.success);
          if (index < evaluation.strengths.length - 1) doc.moveDown(SPACING.item);
        });

        doc.moveDown(SPACING.section);
      }

      // =========================
      // CRITICAL WEAKNESSES
      // =========================

      if (evaluation.improvements && evaluation.improvements.length > 0) {
        drawSectionHeader(doc, '⚠ AREAS REQUIRING IMPROVEMENT', COLORS.warning);
        doc.moveDown(SPACING.subsection);

        evaluation.improvements.forEach((improvement, index) => {
          drawBulletPoint(doc, improvement, COLORS.warning);
          if (index < evaluation.improvements.length - 1) doc.moveDown(SPACING.item);
        });

        doc.moveDown(SPACING.section);
      }

      // =========================
      // RECOMMENDED ACTIONS
      // =========================

      if (evaluation.nextSteps && evaluation.nextSteps.length > 0) {
        drawSectionHeader(doc, '→ RECOMMENDED NEXT STEPS', COLORS.info);
        doc.moveDown(SPACING.subsection);

        evaluation.nextSteps.forEach((step, index) => {
          drawNumberedItem(doc, index + 1, step, COLORS.info);
          if (index < evaluation.nextSteps.length - 1) doc.moveDown(SPACING.item);
        });

        doc.moveDown(SPACING.section);
      }

      // =========================
      // PAGE 3: DETAILED ANALYSIS
      // =========================

      if (evaluation.reasoning) {
        doc.addPage();

        drawSectionHeader(doc, 'COMPREHENSIVE EVALUATION ANALYSIS', COLORS.primary);
        doc.moveDown(SPACING.section);

        doc
          .fontSize(9)
          .font('Courier')
          .fillColor(COLORS.text.body)
          .text(evaluation.reasoning, {
            align: 'left',
            lineGap: 3
          });

        doc.moveDown(SPACING.section);
      }

      // =========================
      // UPLOADED DOCUMENTS
      // =========================

      if (evaluation.uploadedDocuments && evaluation.uploadedDocuments.length > 0) {
        // Check if we need a new page
        if (doc.y > doc.page.height - 250) {
          doc.addPage();
        }

        drawSectionHeader(doc, 'SUPPORTING DOCUMENTATION', COLORS.info);
        doc.moveDown(SPACING.subsection);

        doc.fontSize(10).font('Helvetica').fillColor(COLORS.text.body);

        evaluation.uploadedDocuments.forEach((document, index) => {
          doc.text(`${index + 1}. ${document.documentType}: ${document.fileName}`, {
            indent: 20
          });
          if (document.fileSize) {
            doc
              .fontSize(9)
              .fillColor(COLORS.text.muted)
              .text(`   Size: ${formatFileSize(document.fileSize)}`, { indent: 20 });
            doc.fontSize(10).fillColor(COLORS.text.body);
          }
          doc.moveDown(SPACING.item);
        });

        doc.moveDown(SPACING.section);
      }

      // =========================
      // FOOTER - DISCLAIMER
      // =========================

      // Go to bottom of last page
      const bottomMargin = 80;
      doc.y = doc.page.height - bottomMargin;

      drawHorizontalLine(doc, COLORS.text.light);
      doc.moveDown(SPACING.subsection);

      doc
        .fontSize(9)
        .font('Helvetica-Oblique')
        .fillColor(COLORS.text.muted)
        .text('IMPORTANT DISCLAIMER', { align: 'center' });

      doc.moveDown(SPACING.item);

      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          'This evaluation is for informational and educational purposes only. It does not constitute legal advice.',
          { align: 'center', lineGap: 2 }
        );

      doc.text(
        'Please consult with a licensed immigration attorney for official guidance on your visa application.',
        { align: 'center', lineGap: 2 }
        );

      doc.moveDown(SPACING.subsection);

      doc
        .fontSize(7)
        .fillColor(COLORS.text.light)
        .text(`Evaluation ID: ${evaluation._id}`, { align: 'center' });

      doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, { align: 'center' });

      // Add page numbers
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .fillColor(COLORS.text.light)
          .text(
            `Page ${i + 1} of ${range.count}`,
            50,
            doc.page.height - 30,
            { align: 'center' }
          );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// =========================
// HELPER FUNCTIONS
// =========================

function drawHorizontalLine(doc: PDFKit.PDFDocument, color: string, thickness: number = 1) {
  const y = doc.y;
  doc
    .strokeColor(color)
    .lineWidth(thickness)
    .moveTo(60, y)
    .lineTo(doc.page.width - 60, y)
    .stroke();
}

function drawSectionHeader(doc: PDFKit.PDFDocument, title: string, color: string) {
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor(color)
    .text(title);
}

function drawSectionBox(doc: PDFKit.PDFDocument, title: string, color: string) {
  const boxY = doc.y;
  const boxHeight = 25;

  doc
    .rect(60, boxY, doc.page.width - 120, boxHeight)
    .fillOpacity(0.1)
    .fillAndStroke(color, color)
    .fillOpacity(1);

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor(color)
    .text(title, 60, boxY + 8, { width: doc.page.width - 120, align: 'center' });

  doc.y = boxY + boxHeight;
}

function drawScoreBar(doc: PDFKit.PDFDocument, label: string, score: number) {
  const barWidth = 300;
  const barHeight = 18;
  const x = 80;
  const y = doc.y;

  // Label
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor(COLORS.text.body)
    .text(label, x, y);

  // Background bar
  doc
    .rect(x + 200, y, barWidth, barHeight)
    .fillOpacity(0.1)
    .fillAndStroke(COLORS.text.light, COLORS.text.light)
    .fillOpacity(1);

  // Filled bar (score)
  const fillWidth = (score / 100) * barWidth;
  const barColor = getBarColor(score);

  doc
    .rect(x + 200, y, fillWidth, barHeight)
    .fillAndStroke(barColor, barColor);

  // Score text
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor(COLORS.text.heading)
    .text(`${score}`, x + 200 + barWidth + 10, y + 3);

  doc.y = y + barHeight + 3;
}

function drawBulletPoint(doc: PDFKit.PDFDocument, text: string, color: string) {
  const x = 80;
  const bulletX = x;
  const textX = x + 15;

  // Draw bullet
  doc
    .circle(bulletX + 3, doc.y + 5, 3)
    .fillAndStroke(color, color);

  // Draw text
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor(COLORS.text.body)
    .text(text, textX, doc.y, {
      width: doc.page.width - textX - 80,
      lineGap: 3
      });
}

function drawNumberedItem(doc: PDFKit.PDFDocument, number: number, text: string, color: string) {
  const x = 80;
  const numberX = x;
  const textX = x + 25;

  // Draw number circle
  doc
    .circle(numberX + 8, doc.y + 7, 10)
    .fillOpacity(0.2)
    .fillAndStroke(color, color)
    .fillOpacity(1);

  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(color)
    .text(number.toString(), numberX + 5, doc.y + 3);

  // Draw text
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor(COLORS.text.body)
    .text(text, textX, doc.y - 10, {
      width: doc.page.width - textX - 80,
      lineGap: 3
    });
}

function getScoreColor(category: string): string {
  const colors: Record<string, string> = {
    strong_candidate: COLORS.score.strong,
    moderate_fit: COLORS.score.moderate,
    consider_alternatives: COLORS.score.consider,
    not_recommended: COLORS.score.notRecommended
  };
  return colors[category] || COLORS.text.muted;
}

function getBarColor(score: number): string {
  if (score >= 80) return COLORS.success;
  if (score >= 60) return COLORS.info;
  if (score >= 40) return COLORS.warning;
  return COLORS.danger;
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    strong_candidate: 'STRONG CANDIDATE',
    moderate_fit: 'MODERATE FIT',
    consider_alternatives: 'CONSIDER ALTERNATIVES',
    not_recommended: 'NOT RECOMMENDED'
  };
  return labels[category] || 'EVALUATED';
}

function getApprovalLikelihood(score: number): string {
  if (score >= 75) return 'High - Strong application';
  if (score >= 60) return 'Moderate - Competitive with improvements';
  if (score >= 40) return 'Low - Significant improvements needed';
  return 'Very Low - Consider alternative visa options';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
