export interface BlockchainAuditRecord {
  verificationId: string;
  documentHash: string; // Hash of the document data only, no PII
  resultHash: string;
  status: string;
  verificationScore: number;
  timestamp: string;
}

export interface FabricAnchorResponse {
  txId: string | null;
  status: 'PENDING' | 'RECORDED' | 'UNAVAILABLE' | 'FAILED';
}

export interface IntegrityCheckResponse {
  valid: boolean;
  storedHash?: string;
  currentHash?: string;
  error?: string;
}
