import { extractDocumentAction, verifyDocumentAction } from './extract';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  
  const blob = new Blob([dummyPng], { type: 'image/png' });
  const file = new File([blob], 'dummy.png', { type: 'image/png' });
  
  const formData = new FormData();
  formData.append('document', file);

  console.log("Testing complete UI-flow Action...");
  const extractRes = await extractDocumentAction(formData);
  
  if (extractRes.success && extractRes.data) {
     const verifyRes = await verifyDocumentAction(extractRes.data);
     console.log("Final verification returned:", verifyRes.status);
  } else {
     console.error("Extraction failed", extractRes);
  }
}

main();
