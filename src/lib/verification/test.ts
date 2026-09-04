import { verifyPassport } from './verifyPassport';

async function runTests() {
  console.log("=== VerifyX Rule Engine Tests ===\n");

  // CASE 1 — Genuine
  const case1 = await verifyPassport({
    documentNumber: 'P1234567',
    surname: 'Sharma',
    givenName: 'Rahul',
    dateOfBirth: '2002-08-14',
    nationality: 'IND',
    sex: 'M',
    dateOfExpiry: '2032-06-12'
  } as any);
  console.log(`CASE 1 (Genuine) => Status: ${case1.status}, Expected: VERIFIED, Passed: ${case1.status === 'VERIFIED'}`);

  // CASE 2 — Name mismatch
  const case2 = await verifyPassport({
    documentNumber: 'P1234567',
    surname: 'Verma', // Mismatch
    givenName: 'Rahul',
    dateOfBirth: '2002-08-14',
    nationality: 'IND',
    sex: 'M',
    dateOfExpiry: '2032-06-12'
  } as any);
  console.log(`CASE 2 (Name Mismatch) => Status: ${case2.status}, Expected: FLAGGED, Passed: ${case2.status === 'FLAGGED'}`);

  // CASE 3 — DOB mismatch
  const case3 = await verifyPassport({
    documentNumber: 'P1234567',
    surname: 'Sharma',
    givenName: 'Rahul',
    dateOfBirth: '2001-08-14', // Mismatch
    nationality: 'IND',
    sex: 'M',
    dateOfExpiry: '2032-06-12'
  } as any);
  console.log(`CASE 3 (DOB Mismatch) => Status: ${case3.status}, Expected: FLAGGED, Passed: ${case3.status === 'FLAGGED'}`);

  // CASE 4 — Expired passport
  const case4 = await verifyPassport({
    documentNumber: 'VX5518239', // This passport is EXPIRED in registry
    surname: 'Patel',
    givenName: 'Arjun',
    dateOfBirth: '1999-12-04',
    nationality: 'IND',
    sex: 'M',
    dateOfExpiry: '2025-02-18'
  } as any);
  console.log(`CASE 4 (Expired Passport) => Status: ${case4.status}, Expected: FLAGGED, Passed: ${case4.status === 'FLAGGED'}`);

  // CASE 5 — Unknown passport
  const case5 = await verifyPassport({
    documentNumber: 'P9999999', // Does not exist
    surname: 'Person',
    givenName: 'Unknown',
    dateOfBirth: '2000-01-01',
    nationality: 'IND',
    sex: 'M',
    dateOfExpiry: '2030-01-01'
  } as any);
  console.log(`CASE 5 (Unknown Passport) => Status: ${case5.status}, Expected: REJECTED, Passed: ${case5.status === 'REJECTED'}`);

  // CASE 6 — Synthetic Demo VX1234567 (Genuine)
  const case6 = await verifyPassport({
    documentNumber: 'VX1234567',
    surname: 'SHARMA',
    givenName: 'RAHUL',
    dateOfBirth: '2002-08-14',
    nationality: 'IND',
    sex: 'M',
    dateOfExpiry: '2032-06-12'
  } as any);
  console.log(`CASE 6 (VX Demo ID Genuine) => Status: ${case6.status}, Expected: VERIFIED, Passed: ${case6.status === 'VERIFIED'}`);

  // CASE 7 — Synthetic Demo VX1234567 (Wrong DOB)
  const case7 = await verifyPassport({
    documentNumber: 'VX1234567',
    surname: 'SHARMA',
    givenName: 'RAHUL',
    dateOfBirth: '2000-01-01', // Mismatch
    nationality: 'IND',
    sex: 'M',
    dateOfExpiry: '2032-06-12'
  } as any);
  console.log(`CASE 7 (VX Demo ID Wrong DOB) => Status: ${case7.status}, Expected: FLAGGED, Passed: ${case7.status === 'FLAGGED'}`);

  // CASE 8 — Synthetic Demo Unknown Document Number
  const case8 = await verifyPassport({
    documentNumber: 'VX9999999', // Unknown
    surname: 'SHARMA',
    givenName: 'RAHUL',
    dateOfBirth: '2002-08-14',
    nationality: 'IND',
    sex: 'M',
    dateOfExpiry: '2032-06-12'
  } as any);
  console.log(`CASE 8 (Unknown VX Demo ID) => Status: ${case8.status}, Expected: REJECTED, Passed: ${case8.status === 'REJECTED'}`);

  // CASE 9 — Missing Required Field
  const case9 = await verifyPassport({
    documentNumber: 'VX1234567',
    // surname is deliberately omitted
    givenName: 'RAHUL',
    dateOfBirth: '2002-08-14',
    nationality: 'IND',
    sex: 'M',
    dateOfExpiry: '2032-06-12'
  } as any);
  console.log(`CASE 9 (Missing Field) => Status: ${case9.status}, Expected: FLAGGED, Passed: ${case9.status === 'FLAGGED'}`);

  console.log(`\nSample Verification ID generated: ${case6.verificationId}`);
  console.log(`Sample Timestamp: ${case6.timestamp}`);
  console.log(`Sample Result Hash: ${case6.resultHash}`);
}

runTests();
