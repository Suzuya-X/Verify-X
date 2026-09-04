import { submitFabricTransaction, verifyFabricIntegrity } from './fabric';
import { BlockchainAuditRecord, FabricAnchorResponse, IntegrityCheckResponse } from './types';

// Export types so other files can just import from adapter.ts if they want
export * from './types';

export async function anchorToBlockchain(record: BlockchainAuditRecord): Promise<FabricAnchorResponse> {
  const isFabricEnabled = process.env.FABRIC_ENABLED === 'true';

  if (!isFabricEnabled) {
    console.log('--- BLOCKCHAIN ADAPTER INTERFACE ---');
    console.log('FABRIC_ENABLED is false or missing. Fabric is PENDING/UNAVAILABLE.');
    return {
      txId: null,
      status: 'UNAVAILABLE'
    };
  }

  console.log('--- HYPERLEDGER FABRIC INTEGRATION ---');
  console.log('Attempting to anchor to Fabric...');
  
  try {
    const txId = await submitFabricTransaction(record);
    return {
      txId,
      status: 'RECORDED'
    };
  } catch (error: any) {
    console.error('Fabric transaction failed:', error.message);
    return {
      txId: null,
      status: 'FAILED'
    };
  }
}

export async function verifyBlockchainIntegrity(verificationId: string, currentHash: string): Promise<IntegrityCheckResponse> {
  const isFabricEnabled = process.env.FABRIC_ENABLED === 'true';
  
  if (!isFabricEnabled) {
    return {
      valid: false,
      error: 'Fabric integration is disabled. Cannot verify integrity.'
    };
  }

  try {
    return await verifyFabricIntegrity(verificationId, currentHash);
  } catch (error: any) {
    console.error('Fabric integrity verification failed:', error.message);
    return {
      valid: false,
      error: 'Fabric gateway unavailable or failed.'
    };
  }
}
