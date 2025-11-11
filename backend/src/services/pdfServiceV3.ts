import PDFDocument from 'pdfkit';
import { IEvaluation } from '../models/Evaluation';

/**
 * IMPROVED PDF Generation Service V3
 * - Compact layout with no excessive spacing
 * - Beautiful color-coded sections
 * - Organized comprehensive analysis with visual hierarchy
 * - No empty pages
 * - Easy to read for customers/clients
 */

const COLORS = {
  primary: '#667eea',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  teal: '#14b8a6',
  text: {
    heading: '#1f2937',
    body: '#374151',
    muted: '#6b7280',
    light: '#9ca3af'
  },
  background: {
    success: '#d1fae5',
    warning: '#fed7aa',
    danger: '#fecaca',
    info: '#dbeafe',
    gray: '#f3f4f6'
  }
};

const SPACING = {
  tiny: 0.2,
  small: 0.4,
  medium: 0.7,
  large: 1.2
};

export const generateEvaluationPDF = async (evaluation: IEvaluation): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
        size: 'LETTER',
        bufferPages: true
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const pageWidth = doc.page.width;
      const leftMargin = 50;
      const rightMargin = pageWidth - 50;
      const contentWidth = rightMargin - leftMargin;

      // =========================
      // PAGE 1: HEADER & OVERVIEW
      // =========================

      // Header
      doc
        .fontSize(26)
        .font('Helvetica-Bold')
        .fillColor(COLORS.primary)
        .text('O-1A VISA EVALUATION REPORT', { align: 'center' });

      moveDown(doc, SPACING.small);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor(COLORS.text.muted)
        .text('Official USCIS Criteria Assessment', { align: 'center' });

      moveDown(doc, SPACING.large);

      // Applicant Information - Compact Box
      drawInfoBox(doc, 'APPLICANT INFORMATION', [
        { label: 'Name', value: `${evaluation.firstName} ${evaluation.lastName}` },
        { label: 'Email', value: evaluation.email },
        ...(evaluation.phone ? [{ label: 'Phone', value: evaluation.phone }] : []),
        { label: 'Location', value: evaluation.currentLocation },
        { label: 'Target Country', value: evaluation.targetCountry },
        { label: 'Visa Type', value: evaluation.visaType },
        { label: 'Evaluation Date', value: new Date(evaluation.evaluatedAt || evaluation.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }
      ], COLORS.info);

      moveDown(doc, SPACING.large);

      // Score Display - Compact
      const scoreColor = getScoreColor(evaluation.scoreCategory);
      const scoreY = doc.y;

      // Score box
      doc
        .rect(leftMargin + contentWidth / 2 - 80, scoreY, 160, 100)
        .fillOpacity(0.05)
        .fillAndStroke(scoreColor, scoreColor)
        .fillOpacity(1);

      doc
        .fontSize(48)
        .font('Helvetica-Bold')
        .fillColor(scoreColor)
        .text(evaluation.score.toString(), leftMargin, scoreY + 15, {
          width: contentWidth,
          align: 'center'
        });

      doc
        .fontSize(14)
        .font('Helvetica')
        .fillColor(COLORS.text.muted)
        .text('/100', leftMargin, scoreY + 62, {
          width: contentWidth,
          align: 'center'
        });

      doc.y = scoreY + 110;
      moveDown(doc, SPACING.small);

      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor(scoreColor)
        .text(getCategoryLabel(evaluation.scoreCategory), { align: 'center' });

      moveDown(doc, SPACING.small);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor(COLORS.text.body)
        .text(getApprovalLikelihood(evaluation.score), { align: 'center' });

      moveDown(doc, SPACING.large);

      // Executive Summary - Compact
      if (evaluation.summary) {
        drawSectionHeader(doc, 'EXECUTIVE SUMMARY', COLORS.primary);
        moveDown(doc, SPACING.medium);

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor(COLORS.text.body)
          .text(evaluation.summary, {
            align: 'left',
            lineGap: 2
          });

        moveDown(doc, SPACING.large);
      }

      // =========================
      // PAGE 2: SCORE BREAKDOWN
      // =========================

      // Check if we need new page (use page height, not width)
      if (doc.y > doc.page.height - 200) {
        doc.addPage();
      }

      drawSectionHeader(doc, 'SCORE BREAKDOWN', COLORS.primary);
      moveDown(doc, SPACING.medium);

      if (evaluation.scoreBreakdown) {
        const breakdown = evaluation.scoreBreakdown;

        drawCompactScoreBar(doc, 'Experience', breakdown.experience);
        drawCompactScoreBar(doc, 'Education', breakdown.education);
        drawCompactScoreBar(doc, 'Specialization', breakdown.specialization);
        drawCompactScoreBar(doc, 'Language', breakdown.language);
        drawCompactScoreBar(doc, 'Documentation', breakdown.documentQuality);

        // O-1A specific
        if (breakdown.o1aCriteriaMet !== undefined) {
          moveDown(doc, SPACING.medium);
          drawSubsectionHeader(doc, 'O-1A Specific Criteria', COLORS.purple);
          moveDown(doc, SPACING.small);

          drawCompactScoreBar(doc, 'USCIS Criteria Met (Need 3/8)', breakdown.o1aCriteriaMet);
          if (breakdown.nationalRecognition !== undefined) {
            drawCompactScoreBar(doc, 'National Recognition', breakdown.nationalRecognition);
          }
          if (breakdown.originalContributions !== undefined) {
            drawCompactScoreBar(doc, 'Original Contributions', breakdown.originalContributions);
          }
        }

        moveDown(doc, SPACING.large);
      }

      // =========================
      // STRENGTHS & WEAKNESSES
      // =========================

      if (evaluation.strengths && evaluation.strengths.length > 0) {
        drawSectionHeader(doc, 'KEY STRENGTHS', COLORS.success);
        moveDown(doc, SPACING.medium);

        evaluation.strengths.forEach((strength, index) => {
          drawCompactBullet(doc, strength, COLORS.success);
          if (index < evaluation.strengths.length - 1) moveDown(doc, SPACING.tiny);
        });

        moveDown(doc, SPACING.large);
      }

      if (evaluation.improvements && evaluation.improvements.length > 0) {
        // Check if we need new page
        if (doc.y > doc.page.height - 150) {
          doc.addPage();
        }

        drawSectionHeader(doc, 'CRITICAL AREAS FOR IMPROVEMENT', COLORS.warning);
        moveDown(doc, SPACING.medium);

        evaluation.improvements.forEach((improvement, index) => {
          drawCompactBullet(doc, improvement, COLORS.warning);
          if (index < evaluation.improvements.length - 1) moveDown(doc, SPACING.tiny);
        });

        moveDown(doc, SPACING.large);
      }

      // =========================
      // RECOMMENDED ACTIONS
      // =========================

      if (evaluation.nextSteps && evaluation.nextSteps.length > 0) {
        // Check if we need new page
        if (doc.y > doc.page.height - 150) {
          doc.addPage();
        }

        drawSectionHeader(doc, 'RECOMMENDED NEXT STEPS', COLORS.info);
        moveDown(doc, SPACING.medium);

        evaluation.nextSteps.forEach((step, index) => {
          drawCompactNumberedItem(doc, index + 1, step, COLORS.info);
          if (index < evaluation.nextSteps.length - 1) moveDown(doc, SPACING.tiny);
        });

        moveDown(doc, SPACING.large);
      }

      // =========================
      // COMPREHENSIVE ANALYSIS - ORGANIZED
      // =========================

      if (evaluation.reasoning) {
        // Only add page if not enough space
        if (doc.y > doc.page.height - 250) {
          doc.addPage();
        } else {
          moveDown(doc, SPACING.large);
        }

        drawSectionHeader(doc, 'COMPREHENSIVE EVALUATION ANALYSIS', COLORS.primary);
        moveDown(doc, SPACING.large);

        // Parse and organize the reasoning text
        const lines = evaluation.reasoning.split('\n').filter(line => line.trim().length > 0);

        for (const line of lines) {
          const trimmed = line.trim();

          // Check available space
          if (doc.y > doc.page.height - 100) {
            doc.addPage();
          }

          // Section headers (=== ... ===)
          if (trimmed.startsWith('===') && trimmed.endsWith('===')) {
            moveDown(doc, SPACING.medium);
            const header = trimmed.replace(/=/g, '').trim();
            doc
              .fontSize(12)
              .font('Helvetica-Bold')
              .fillColor(COLORS.purple)
              .text(header);
            moveDown(doc, SPACING.small);
            continue;
          }

          // Subsection headers (--- ... ---)
          if (trimmed.startsWith('---') && trimmed.endsWith('---')) {
            moveDown(doc, SPACING.medium);
            const subheader = trimmed.replace(/-/g, '').trim();
            doc
              .fontSize(11)
              .font('Helvetica-Bold')
              .fillColor(COLORS.info)
              .text(subheader);
            moveDown(doc, SPACING.small);
            continue;
          }

          // Criteria items (1. 2. 3. ...)
          const criteriaMatch = trimmed.match(/^(\d+)\.\s+(.+?):(.+)/);
          if (criteriaMatch) {
            const [, num, name, rest] = criteriaMatch;
            moveDown(doc, SPACING.small);

            // Criteria header with colored background
            const criteriaY = doc.y;
            doc
              .rect(leftMargin, criteriaY, contentWidth, 18)
              .fillOpacity(0.1)
              .fillAndStroke(COLORS.teal, COLORS.teal)
              .fillOpacity(1);

            doc
              .fontSize(10)
              .font('Helvetica-Bold')
              .fillColor(COLORS.teal)
              .text(`${num}. ${name}`, leftMargin + 5, criteriaY + 5);

            doc.y = criteriaY + 22;

            // Criteria details
            doc
              .fontSize(9)
              .font('Helvetica')
              .fillColor(COLORS.text.body)
              .text(rest.trim(), leftMargin + 10, doc.y, {
                width: contentWidth - 20,
                lineGap: 2
              });

            moveDown(doc, SPACING.tiny);
            continue;
          }

          // Status indicators with checkmarks/crosses
          const statusMatch = trimmed.match(/^(.+?):\s*(YES ✓|NO ✗|✓|✗)/);
          if (statusMatch) {
            const [, label, status] = statusMatch;
            const isPositive = status.includes('✓') || status.includes('YES');
            const color = isPositive ? COLORS.success : COLORS.danger;
            const icon = isPositive ? '✓' : '✗';

            doc
              .fontSize(9)
              .font('Helvetica')
              .fillColor(COLORS.text.body)
              .text(`${icon} `, leftMargin, doc.y, { continued: true })
              .fillColor(color)
              .text(label, { continued: true })
              .fillColor(COLORS.text.muted)
              .text(`: ${status}`);

            moveDown(doc, SPACING.tiny);
            continue;
          }

          // Indented details (starts with spaces or "   ")
          if (trimmed.startsWith('   ') || line.startsWith('   ')) {
            doc
              .fontSize(9)
              .font('Helvetica')
              .fillColor(COLORS.text.body)
              .text(trimmed, leftMargin + 15, doc.y, {
                width: contentWidth - 25,
                lineGap: 1
              });
            moveDown(doc, SPACING.tiny);
            continue;
          }

          // Key metrics (Score: XX, Criteria Met: X/8, etc.)
          if (trimmed.includes(':') && trimmed.length < 100) {
            const [key, value] = trimmed.split(':');
            doc
              .fontSize(9)
              .font('Helvetica-Bold')
              .fillColor(COLORS.text.heading)
              .text(key.trim() + ': ', leftMargin, doc.y, { continued: true })
              .font('Helvetica')
              .fillColor(COLORS.text.body)
              .text(value.trim());

            moveDown(doc, SPACING.tiny);
            continue;
          }

          // Regular text
          doc
            .fontSize(9)
            .font('Helvetica')
            .fillColor(COLORS.text.body)
            .text(trimmed, leftMargin, doc.y, {
              width: contentWidth,
              lineGap: 2
            });

          moveDown(doc, SPACING.tiny);
        }

        moveDown(doc, SPACING.large);
      }

      // =========================
      // UPLOADED DOCUMENTS
      // =========================

      if (evaluation.uploadedDocuments && evaluation.uploadedDocuments.length > 0) {
        if (doc.y > doc.page.height - 200) {
          doc.addPage();
        }

        drawSectionHeader(doc, 'SUPPORTING DOCUMENTATION', COLORS.info);
        moveDown(doc, SPACING.medium);

        evaluation.uploadedDocuments.forEach((document, index) => {
          doc
            .fontSize(9)
            .font('Helvetica')
            .fillColor(COLORS.text.body)
            .text(`${index + 1}. ${document.documentType}: `, leftMargin, doc.y, { continued: true })
            .fillColor(COLORS.text.muted)
            .text(document.fileName);

          if (document.fileSize) {
            doc
              .fontSize(8)
              .fillColor(COLORS.text.light)
              .text(`   ${formatFileSize(document.fileSize)}`, leftMargin + 15);
          }

          moveDown(doc, SPACING.tiny);
        });

        moveDown(doc, SPACING.large);
      }

      // =========================
      // FOOTER - DISCLAIMER
      // =========================

      // Add footer on current page (don't switch pages unnecessarily)
      const currentY = doc.y;

      // Only add footer if we have enough space, otherwise skip it
      if (currentY < doc.page.height - 120) {
        moveDown(doc, SPACING.large);

        drawHorizontalLine(doc, COLORS.text.light);
        moveDown(doc, SPACING.small);

        doc
          .fontSize(8)
          .font('Helvetica-Bold')
          .fillColor(COLORS.text.muted)
          .text('DISCLAIMER', { align: 'center' });

        moveDown(doc, SPACING.tiny);

        doc
          .fontSize(7)
          .font('Helvetica')
          .text(
            'This evaluation is for informational purposes only and does not constitute legal advice. ' +
            'Please consult with a licensed immigration attorney for official guidance.',
            { align: 'center', lineGap: 1 }
          );

        moveDown(doc, SPACING.small);

        doc
          .fontSize(7)
          .fillColor(COLORS.text.light)
          .text(`Evaluation ID: ${evaluation._id} | Generated: ${new Date().toLocaleString('en-US')}`, {
            align: 'center'
          });
      }

      // Get actual page count AFTER all content is added
      const range = doc.bufferedPageRange();
      const totalPages = range.count;

      // Add page numbers to all pages
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);

        // Only add page number if the page has content (check if it's beyond the first page or has content)
        doc
          .fontSize(8)
          .fillColor(COLORS.text.light)
          .text(`Page ${i + 1} of ${totalPages}`, 50, doc.page.height - 30, {
            align: 'center',
            width: doc.page.width - 100
          });
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

function moveDown(doc: PDFKit.PDFDocument, spacing: number) {
  doc.moveDown(spacing);
}

function drawHorizontalLine(doc: PDFKit.PDFDocument, color: string, thickness: number = 0.5) {
  const y = doc.y;
  doc
    .strokeColor(color)
    .lineWidth(thickness)
    .moveTo(50, y)
    .lineTo(doc.page.width - 50, y)
    .stroke();
}

function drawSectionHeader(doc: PDFKit.PDFDocument, title: string, color: string) {
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor(color)
    .text(title);
}

function drawSubsectionHeader(doc: PDFKit.PDFDocument, title: string, color: string) {
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor(color)
    .text(title);
}

function drawInfoBox(
  doc: PDFKit.PDFDocument,
  title: string,
  items: Array<{ label: string; value: string }>,
  color: string
) {
  const startY = doc.y;
  const boxHeight = 20 + items.length * 15;

  // Background
  doc
    .rect(50, startY, doc.page.width - 100, boxHeight)
    .fillOpacity(0.05)
    .fillAndStroke(color, color)
    .fillOpacity(1);

  // Title
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor(color)
    .text(title, 60, startY + 8);

  // Items
  let itemY = startY + 25;
  items.forEach(item => {
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(COLORS.text.heading)
      .text(item.label + ':', 60, itemY, { continued: true })
      .font('Helvetica')
      .fillColor(COLORS.text.body)
      .text(' ' + item.value);

    itemY += 15;
  });

  doc.y = startY + boxHeight + 5;
}

function drawCompactScoreBar(doc: PDFKit.PDFDocument, label: string, score: number) {
  const barWidth = 250;
  const barHeight = 14;
  const x = 70;
  const y = doc.y;

  // Label
  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor(COLORS.text.body)
    .text(label, x, y + 2);

  // Background bar
  const barX = x + 180;
  doc
    .rect(barX, y, barWidth, barHeight)
    .fillOpacity(0.1)
    .fillAndStroke(COLORS.text.light, COLORS.text.light)
    .fillOpacity(1);

  // Filled bar
  const fillWidth = (score / 100) * barWidth;
  const barColor = getBarColor(score);

  doc
    .rect(barX, y, fillWidth, barHeight)
    .fillAndStroke(barColor, barColor);

  // Score text
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(COLORS.text.heading)
    .text(Math.round(score).toString(), barX + barWidth + 10, y + 2);

  doc.y = y + barHeight + 4;
}

function drawCompactBullet(doc: PDFKit.PDFDocument, text: string, color: string) {
  const x = 60;
  const bulletX = x;
  const textX = x + 12;
  const startY = doc.y;

  // Draw bullet
  doc
    .circle(bulletX + 2, startY + 4, 2.5)
    .fillAndStroke(color, color);

  // Draw text
  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor(COLORS.text.body)
    .text(text, textX, startY, {
      width: doc.page.width - textX - 60,
      lineGap: 2
    });
}

function drawCompactNumberedItem(doc: PDFKit.PDFDocument, number: number, text: string, color: string) {
  const x = 60;
  const numberX = x;
  const textX = x + 22;
  const startY = doc.y;

  // Draw number circle
  doc
    .circle(numberX + 6, startY + 5, 8)
    .fillOpacity(0.15)
    .fillAndStroke(color, color)
    .fillOpacity(1);

  doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .fillColor(color)
    .text(number.toString(), numberX + 3, startY + 2);

  // Draw text
  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor(COLORS.text.body)
    .text(text, textX, startY, {
      width: doc.page.width - textX - 60,
      lineGap: 2
    });
}

function getScoreColor(category: string): string {
  const colors: Record<string, string> = {
    strong_candidate: COLORS.success,
    moderate_fit: COLORS.info,
    consider_alternatives: COLORS.warning,
    not_recommended: COLORS.danger
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
  if (score >= 75) return 'High Approval Likelihood';
  if (score >= 60) return 'Moderate Approval Likelihood';
  if (score >= 40) return 'Low Approval Likelihood';
  return 'Very Low Approval Likelihood';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
