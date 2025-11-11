import mongoose, { Schema, Document } from 'mongoose';

export interface IUploadedDocument {
  documentType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  fileSize: number;
}

export interface IEvaluation extends Document {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentLocation: string;
  professionalSummary: string;

  // Visa Selection
  targetCountry: string;
  visaType: string;
  visaTypeId: string;

  // Documents
  uploadedDocuments: IUploadedDocument[];

  // Evaluation Results
  score: number;
  scoreCategory: 'strong_candidate' | 'moderate_fit' | 'consider_alternatives' | 'not_recommended';
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  summary: string;
  reasoning: string;
  scoreBreakdown?: {
    experience: number;
    education: number;
    specialization: number;
    language: number;
    documentQuality: number;
    // O-1A specific
    o1aCriteriaMet?: number;
    nationalRecognition?: number;
    originalContributions?: number;
  };

  // Metadata
  evaluatedAt?: Date;
  partnerKey?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

const uploadedDocumentSchema = new Schema({
  documentType: {
    type: String,
    required: true,
    enum: ['resume', 'education', 'experience', 'personal_statement', 'language_certificate', 'other']
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  fileSize: {
    type: Number,
    required: true
  }
});

const evaluationSchema = new Schema<IEvaluation>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      trim: true
    },
    currentLocation: {
      type: String,
      required: true,
      trim: true
    },
    professionalSummary: {
      type: String,
      required: true
    },
    targetCountry: {
      type: String,
      required: true,
      index: true
    },
    visaType: {
      type: String,
      required: true,
      index: true
    },
    visaTypeId: {
      type: String,
      required: true,
      index: true
    },
    uploadedDocuments: [uploadedDocumentSchema],
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    scoreCategory: {
      type: String,
      enum: ['strong_candidate', 'moderate_fit', 'consider_alternatives', 'not_recommended'],
      default: 'consider_alternatives'
    },
    strengths: [{
      type: String
    }],
    improvements: [{
      type: String
    }],
    nextSteps: [{
      type: String
    }],
    summary: {
      type: String,
      default: ''
    },
    reasoning: {
      type: String,
      default: ''
    },
    scoreBreakdown: {
      experience: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      specialization: { type: Number, default: 0 },
      language: { type: Number, default: 0 },
      documentQuality: { type: Number, default: 0 },
      // O-1A specific fields
      o1aCriteriaMet: { type: Number },
      nationalRecognition: { type: Number },
      originalContributions: { type: Number }
    },
    evaluatedAt: {
      type: Date
    },
    partnerKey: {
      type: String,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true
    },
    expiresAt: {
      type: Date,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for common queries
evaluationSchema.index({ email: 1, createdAt: -1 });
evaluationSchema.index({ partnerKey: 1, createdAt: -1 });
evaluationSchema.index({ status: 1, createdAt: -1 });
evaluationSchema.index({ targetCountry: 1, visaType: 1 });

// TTL index for automatic deletion of expired evaluations
evaluationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Evaluation = mongoose.model<IEvaluation>('Evaluation', evaluationSchema);
