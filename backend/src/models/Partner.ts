import mongoose, { Schema, Document } from 'mongoose';

export interface IPartner extends Document {
  partnerName: string;
  apiKey: string;
  email: string;
  companyWebsite?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  submissionCount: number;
  allowedOrigins: string[];
  embeddedOn: string[];
  metadata?: Record<string, any>;
}

const partnerSchema = new Schema<IPartner>(
  {
    partnerName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    companyWebsite: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    submissionCount: {
      type: Number,
      default: 0,
      min: 0
    },
    allowedOrigins: [{
      type: String,
      trim: true
    }],
    embeddedOn: [{
      type: String,
      trim: true
    }],
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Index for active partners
partnerSchema.index({ isActive: 1, createdAt: -1 });

export const Partner = mongoose.model<IPartner>('Partner', partnerSchema);
