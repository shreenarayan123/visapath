import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserSubmission extends Document {
  email: string;
  evaluationIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  lastSubmissionAt: Date;
}

const userSubmissionSchema = new Schema<IUserSubmission>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    evaluationIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Evaluation'
    }],
    lastSubmissionAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Index for recent submissions
userSubmissionSchema.index({ lastSubmissionAt: -1 });

export const UserSubmission = mongoose.model<IUserSubmission>('UserSubmission', userSubmissionSchema);
