import mongoose, { Schema, Document } from 'mongoose';

export interface IRequiredDocument {
  documentType: string;
  isRequired: boolean;
  description: string;
}

export interface IEligibilityCriteria {
  minExperienceYears: number;
  minEducationLevel: 'high_school' | 'bachelor' | 'master' | 'phd';
  specializations: string[];
  languageRequirement: string;
  minimumSalary?: number;
}

export interface IScoringWeights {
  experience: number;
  education: number;
  specialization: number;
  language: number;
  documentQuality: number;
}

export interface IVisaType extends Document {
  countryCode: string;
  countryName: string;
  visaTypeId: string;
  visaName: string;
  description: string;
  requiredDocuments: IRequiredDocument[];
  eligibilityCriteria: IEligibilityCriteria;
  scoringWeights: IScoringWeights;
  maxScoreCap: number;
  processingTimeWeeks: number;
  successRatePercent: number;
  officialLink: string;
  createdAt: Date;
  updatedAt: Date;
}

const requiredDocumentSchema = new Schema({
  documentType: {
    type: String,
    required: true
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    required: true
  }
});

const eligibilityCriteriaSchema = new Schema({
  minExperienceYears: {
    type: Number,
    required: true,
    min: 0
  },
  minEducationLevel: {
    type: String,
    required: true,
    enum: ['high_school', 'bachelor', 'master', 'phd']
  },
  specializations: [{
    type: String
  }],
  languageRequirement: {
    type: String,
    default: 'b1'
  },
  minimumSalary: {
    type: Number
  }
});

const scoringWeightsSchema = new Schema({
  experience: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  education: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  specialization: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  language: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  documentQuality: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
});

const visaTypeSchema = new Schema<IVisaType>(
  {
    countryCode: {
      type: String,
      required: true,
      uppercase: true,
      index: true
    },
    countryName: {
      type: String,
      required: true,
      index: true
    },
    visaTypeId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    visaName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    requiredDocuments: [requiredDocumentSchema],
    eligibilityCriteria: {
      type: eligibilityCriteriaSchema,
      required: true
    },
    scoringWeights: {
      type: scoringWeightsSchema,
      required: true
    },
    maxScoreCap: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 85
    },
    processingTimeWeeks: {
      type: Number,
      default: 12
    },
    successRatePercent: {
      type: Number,
      min: 0,
      max: 100
    },
    officialLink: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient country + visa type queries
visaTypeSchema.index({ countryCode: 1, visaTypeId: 1 }, { unique: true });

export const VisaType = mongoose.model<IVisaType>('VisaType', visaTypeSchema);
