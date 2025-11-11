import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Service for parsing and extracting text content from uploaded documents
 */

export interface ParsedDocument {
  fileName: string;
  documentType: string;
  extractedText: string;
  wordCount: number;
  parseSuccess: boolean;
  error?: string;
}

/**
 * Parse a PDF file and extract text content
 */
async function parsePDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    // @ts-ignore - pdf-parse has incorrect type definitions
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse a DOCX file and extract text content
 */
async function parseDOCX(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse a DOC file (older Word format) - basic text extraction
 */
async function parseDOC(filePath: string): Promise<string> {
  try {
    // Mammoth can handle some .doc files, but with limited support
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error parsing DOC:', error);
    // Fallback: read as plain text (limited effectiveness)
    try {
      const buffer = fs.readFileSync(filePath);
      const text = buffer.toString('utf8');
      return text.replace(/[^\x20-\x7E\n\r]/g, ' '); // Remove non-printable chars
    } catch (readError) {
      throw new Error(`Failed to parse DOC: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Parse any supported document type and extract text
 */
export async function parseDocument(filePath: string, fileName: string, documentType: string): Promise<ParsedDocument> {
  const ext = path.extname(fileName).toLowerCase();

  let extractedText = '';
  let parseSuccess = false;
  let error: string | undefined;

  try {
    switch (ext) {
      case '.pdf':
        extractedText = await parsePDF(filePath);
        parseSuccess = true;
        break;

      case '.docx':
        extractedText = await parseDOCX(filePath);
        parseSuccess = true;
        break;

      case '.doc':
        extractedText = await parseDOC(filePath);
        parseSuccess = true;
        break;

      case '.txt':
        extractedText = fs.readFileSync(filePath, 'utf8');
        parseSuccess = true;
        break;

      case '.jpg':
      case '.jpeg':
      case '.png':
        // Image files - would need OCR for text extraction
        extractedText = '[Image file - OCR not implemented]';
        parseSuccess = false;
        error = 'Image file requires OCR for text extraction';
        break;

      default:
        extractedText = '';
        parseSuccess = false;
        error = `Unsupported file type: ${ext}`;
    }
  } catch (err) {
    parseSuccess = false;
    error = err instanceof Error ? err.message : 'Unknown parsing error';
    console.error(`Error parsing document ${fileName}:`, err);
  }

  const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;

  return {
    fileName,
    documentType,
    extractedText: extractedText.trim(),
    wordCount,
    parseSuccess,
    error
  };
}

/**
 * Parse multiple documents and combine results
 */
export async function parseMultipleDocuments(
  documents: Array<{ filePath: string; fileName: string; documentType: string }>
): Promise<ParsedDocument[]> {
  const results: ParsedDocument[] = [];

  for (const doc of documents) {
    const parsed = await parseDocument(doc.filePath, doc.fileName, doc.documentType);
    results.push(parsed);
  }

  return results;
}

/**
 * Combine all parsed text into a single corpus for analysis
 */
export function combineDocumentText(parsedDocuments: ParsedDocument[]): string {
  return parsedDocuments
    .filter(doc => doc.parseSuccess && doc.extractedText.length > 0)
    .map(doc => `--- ${doc.documentType.toUpperCase()}: ${doc.fileName} ---\n${doc.extractedText}`)
    .join('\n\n');
}
