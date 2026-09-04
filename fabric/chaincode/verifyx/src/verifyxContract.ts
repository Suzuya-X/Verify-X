import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';

@Info({ title: 'VerifyXContract', description: 'Smart contract for storing VerifyX verification audits.' })
export class VerifyXContract extends Contract {

    @Transaction()
    public async CreateVerification(
        ctx: Context,
        verificationId: string,
        documentHash: string,
        resultHash: string,
        status: string,
        verificationScore: number,
        timestamp: string
    ): Promise<void> {
        const exists = await this.VerificationExists(ctx, verificationId);
        if (exists) {
            throw new Error(`The verification record ${verificationId} already exists`);
        }

        const auditRecord = {
            docType: 'verification',
            verificationId,
            documentHash,
            resultHash,
            status,
            verificationScore,
            timestamp
        };

        // Ensure determinism in JSON serialization
        await ctx.stub.putState(verificationId, Buffer.from(stringify(sortKeysRecursive(auditRecord))));
    }

    @Transaction(false)
    @Returns('string')
    public async GetVerification(ctx: Context, verificationId: string): Promise<string> {
        const recordBytes = await ctx.stub.getState(verificationId);
        if (!recordBytes || recordBytes.length === 0) {
            throw new Error(`The verification record ${verificationId} does not exist`);
        }
        return recordBytes.toString();
    }

    @Transaction(false)
    @Returns('string')
    public async VerifyIntegrity(ctx: Context, verificationId: string, currentResultHash: string): Promise<string> {
        const recordBytes = await ctx.stub.getState(verificationId);
        if (!recordBytes || recordBytes.length === 0) {
            return JSON.stringify({
                valid: false,
                error: `The verification record ${verificationId} does not exist`
            });
        }
        
        const record = JSON.parse(recordBytes.toString());
        const storedHash = record.resultHash;
        
        return JSON.stringify({
            valid: storedHash === currentResultHash,
            storedHash,
            currentHash: currentResultHash
        });
    }

    @Transaction(false)
    @Returns('boolean')
    public async VerificationExists(ctx: Context, verificationId: string): Promise<boolean> {
        const recordBytes = await ctx.stub.getState(verificationId);
        return recordBytes && recordBytes.length > 0;
    }
}
