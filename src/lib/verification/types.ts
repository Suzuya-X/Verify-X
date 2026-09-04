export type VerificationStatus = 'VERIFIED' | 'FLAGGED' | 'REJECTED';

// The data extracted from a document (e.g., by OCR or an AI model)
export type ExtractedPassport = {
  documentType?: string;
  documentNumber: string;
  surname: string;
  givenName: string;
  dateOfBirth: string;
  nationality: string;
  sex: string;
  dateOfIssue?: string;
  dateOfExpiry: string;
  mrz?: string;
};

// Represents a single field comparison between extracted data and registry data
export type FieldComparison = {
  field: string;
  extracted: string;
  registry: string | null;
  match: boolean;
};

// The final output of the verification engine
export type VerificationResult = {
  verificationId: string;
  timestamp: string;
  resultHash: string;
  auditStorage?: string;
  documentHash?: string; // Stored securely
  fabricTransactionId?: string | null;
  fabricStatus?: 'PENDING' | 'RECORDED' | 'UNAVAILABLE' | 'FAILED';
  status: VerificationStatus;
  reason: string;
  verificationScore: number;
  comparisons: FieldComparison[];
  rulesEvaluated: number;
  rulesPassed: number;
  rulesFailed: number;
};
