import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { ApiError } from '../utils/ApiError';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    void req; void file; // reference unused params to avoid TS6133
    cb(null, uploadsDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    void req; // reference unused param to avoid TS6133
    // Create unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// File filter for allowed types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  void req; // reference unused param to avoid TS6133
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];

  const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `Invalid file type: ${ext}. Allowed types: PDF, DOC, DOCX, JPG, PNG`));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    files: 10 // Maximum 10 files per request
  }
});

// Helper to delete uploaded file
export const deleteFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// Helper to get file URL
export const getFileUrl = (req: Request, filename: string): string => {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/${filename}`;
};
