import { getRegistryRecord } from '../registry/lookup';
import { saveAuditRecord } from '../supabase/audit';
import { anchorToBlockchain } from '../blockchain/adapter';
import { ExtractedPassport, VerificationResult, FieldComparison } from './types';

export async function verifyPassport(extracted: ExtractedPassport): Promise<VerificationResult> {
  // We evaluate 7 core rules: Document Number, Surname, Given Name, DOB, Nationality, Sex, and Expiry/Status
  const totalRules = 7;
  let rulesPassed = 0;
  
  // Weights for our simple MVP score calculation
  const SCORE_WEIGHTS = {
    documentNumber: 25,
    surname: 10,
    givenName: 10,
    dateOfBirth: 20,
    nationality: 10,
    sex: 5,
    statusExpiry: 20
  };

  let verificationScore = 0;

  // Generate unique Verification ID
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const verificationId = `VX-${yyyy}${mm}${dd}-${random}`;
  const timestamp = date.toISOString();

  // STEP 1: Search the registry (Supabase primary, local fallback)
  const { record: registryRecord, source: lookupSource } = await getRegistryRecord(extracted.documentNumber);

  // If no record exists, reject immediately
  if (!registryRecord) {
    const rejectedStatus = 'REJECTED';
    const rejectedReason = 'Document record not found in the authorized registry.';
    const rejectedComparisons: FieldComparison[] = [
      { field: 'Document Number', extracted: extracted.documentNumber || 'null', registry: null, match: false },
      { field: 'Surname', extracted: extracted.surname || 'null', registry: null, match: false },
      { field: 'Given Name', extracted: extracted.givenName || 'null', registry: null, match: false },
      { field: 'Date of Birth', extracted: extracted.dateOfBirth || 'null', registry: null, match: false },
      { field: 'Nationality', extracted: extracted.nationality || 'null', registry: null, match: false },
      { field: 'Sex', extracted: extracted.sex || 'null', registry: null, match: false },
      { field: 'Date of Expiry', extracted: extracted.dateOfExpiry || 'null', registry: null, match: false },
      { field: 'Status', extracted: 'UNKNOWN', registry: null, match: false }
    ];

    const canonicalString = JSON.stringify({
      verificationId,
      timestamp,
      status: rejectedStatus,
      comparisons: rejectedComparisons.map(c => ({ field: c.field, match: c.match }))
    });
    
    const msgUint8 = new TextEncoder().encode(canonicalString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const resultHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const documentDataForHash = {
      documentNumber: extracted.documentNumber,
      surname: extracted.surname,
      givenName: extracted.givenName,
      dateOfBirth: extracted.dateOfBirth
    };
    const docHashStr = JSON.stringify(documentDataForHash, Object.keys(documentDataForHash).sort());
    const docHashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(docHashStr));
    const documentHash = Array.from(new Uint8Array(docHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const partialResult: VerificationResult = {
      verificationId,
      timestamp,
      resultHash,
      documentHash,
      auditStorage: lookupSource, // Temporary storage tag before audit save
      status: rejectedStatus,
      reason: rejectedReason,
      verificationScore: 0,
      comparisons: rejectedComparisons,
      rulesEvaluated: totalRules,
      rulesPassed: 0,
      rulesFailed: totalRules
    };

    // 1. Anchor to Fabric
    const fabricRes = await anchorToBlockchain({
      verificationId: partialResult.verificationId,
      documentHash: partialResult.documentHash!,
      resultHash: partialResult.resultHash,
      status: partialResult.status,
      verificationScore: partialResult.verificationScore,
      timestamp: partialResult.timestamp
    });
    partialResult.fabricTransactionId = fabricRes.txId;
    partialResult.fabricStatus = fabricRes.status;

    // 2. Persist Audit Record to Supabase
    const auditStorage = await saveAuditRecord(partialResult, extracted.documentType || 'unknown', extracted.documentNumber);
    partialResult.auditStorage = auditStorage;

    return partialResult;
  }

  // STEP 2: Compare fields
  const comparisons: FieldComparison[] = [];
  
  // Helper to compare strings case-insensitively
  const checkMatch = (val1: string, val2: string) => (val1 || '').trim().toLowerCase() === (val2 || '').trim().toLowerCase();

  // 1. Document Number
  const documentMatch = checkMatch(extracted.documentNumber, registryRecord.documentNumber);
  comparisons.push({ field: 'Document Number', extracted: extracted.documentNumber, registry: registryRecord.documentNumber, match: documentMatch });
  if (documentMatch) {
    rulesPassed++;
    verificationScore += SCORE_WEIGHTS.documentNumber;
  }

  // 2. Surname
  const surnameMatch = checkMatch(extracted.surname, registryRecord.surname);
  comparisons.push({ field: 'Surname', extracted: extracted.surname, registry: registryRecord.surname, match: surnameMatch });
  if (surnameMatch) {
    rulesPassed++;
    verificationScore += SCORE_WEIGHTS.surname;
  }

  // 3. Given Name
  const givenNameMatch = checkMatch(extracted.givenName, registryRecord.givenName);
  comparisons.push({ field: 'Given Name', extracted: extracted.givenName, registry: registryRecord.givenName, match: givenNameMatch });
  if (givenNameMatch) {
    rulesPassed++;
    verificationScore += SCORE_WEIGHTS.givenName;
  }

  // 4. Date of Birth
  const dobMatch = checkMatch(extracted.dateOfBirth, registryRecord.dateOfBirth);
  comparisons.push({ field: 'Date of Birth', extracted: extracted.dateOfBirth, registry: registryRecord.dateOfBirth, match: dobMatch });
  if (dobMatch) {
    rulesPassed++;
    verificationScore += SCORE_WEIGHTS.dateOfBirth;
  }

  // 5. Nationality
  const nationalityMatch = checkMatch(extracted.nationality, registryRecord.nationality);
  comparisons.push({ field: 'Nationality', extracted: extracted.nationality, registry: registryRecord.nationality, match: nationalityMatch });
  if (nationalityMatch) {
    rulesPassed++;
    verificationScore += SCORE_WEIGHTS.nationality;
  }

  // 6. Sex
  const sexMatch = checkMatch(extracted.sex, registryRecord.sex);
  comparisons.push({ field: 'Sex', extracted: extracted.sex, registry: registryRecord.sex, match: sexMatch });
  if (sexMatch) {
    rulesPassed++;
    verificationScore += SCORE_WEIGHTS.sex;
  }

  // 7. Expiry / Status
  const expiryMatch = checkMatch(extracted.dateOfExpiry, registryRecord.dateOfExpiry);
  comparisons.push({ field: 'Date of Expiry', extracted: extracted.dateOfExpiry, registry: registryRecord.dateOfExpiry, match: expiryMatch });
  
  const statusMatch = registryRecord.status === 'ACTIVE';
  comparisons.push({ field: 'Status', extracted: 'ACTIVE', registry: registryRecord.status, match: statusMatch });
  
  // For the final rule to pass, both expiry date must match AND status must be ACTIVE
  if (expiryMatch && statusMatch) {
    rulesPassed++;
    verificationScore += SCORE_WEIGHTS.statusExpiry;
  }

  // Evaluate final verdict based on logic
  let finalStatus: 'VERIFIED' | 'FLAGGED' | 'REJECTED' = 'VERIFIED';
  let reason = 'All required fields matched the registry and the document is active.';

  // STEP 3: Check document status
  if (registryRecord.status === 'EXPIRED') {
    finalStatus = 'FLAGGED';
    reason = 'Document record exists but the document is expired.';
  } 
  // STEP 4: Check if any critical identity fields don't match
  else if (!surnameMatch || !givenNameMatch || !dobMatch || !nationalityMatch || !sexMatch || !expiryMatch) {
    finalStatus = 'FLAGGED';
    reason = 'One or more document fields do not match the registry record.';
  }

  // STEP 5: Create Canonical JSON for Secure Hashing
  const canonicalString = JSON.stringify({
    verificationId,
    timestamp,
    status: finalStatus,
    comparisons: comparisons.map(c => ({ field: c.field, match: c.match }))
  });
  
  // SHA-256 Web Crypto Implementation
  const msgUint8 = new TextEncoder().encode(canonicalString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const resultHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const documentDataForHash = {
    documentNumber: extracted.documentNumber,
    surname: extracted.surname,
    givenName: extracted.givenName,
    dateOfBirth: extracted.dateOfBirth
  };
  const docHashStr = JSON.stringify(documentDataForHash, Object.keys(documentDataForHash).sort());
  const docHashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(docHashStr));
  const documentHash = Array.from(new Uint8Array(docHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  const finalResult: VerificationResult = {
    verificationId,
    timestamp,
    resultHash,
    documentHash,
    auditStorage: lookupSource, // Base it on lookup source for now
    status: finalStatus,
    reason,
    verificationScore,
    comparisons,
    rulesEvaluated: totalRules,
    rulesPassed,
    rulesFailed: totalRules - rulesPassed
  };

  // 1. Anchor to Fabric
  const fabricRes = await anchorToBlockchain({
    verificationId: finalResult.verificationId,
    documentHash: finalResult.documentHash!,
    resultHash: finalResult.resultHash,
    status: finalResult.status,
    verificationScore: finalResult.verificationScore,
    timestamp: finalResult.timestamp
  });
  finalResult.fabricTransactionId = fabricRes.txId;
  finalResult.fabricStatus = fabricRes.status;

  // 2. Persist Audit Record to Supabase
  const auditStorage = await saveAuditRecord(finalResult, extracted.documentType || 'unknown', extracted.documentNumber);
  finalResult.auditStorage = auditStorage;

  return finalResult;
}
