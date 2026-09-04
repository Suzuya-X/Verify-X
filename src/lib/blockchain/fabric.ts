import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { BlockchainAuditRecord, IntegrityCheckResponse } from './types';

const channelName = process.env.FABRIC_CHANNEL_NAME || 'mychannel';
const chaincodeName = process.env.FABRIC_CHAINCODE_NAME || 'verifyx';
const mspId = process.env.FABRIC_MSP_ID || 'Org1MSP';

// Paths configured in .env.local
const cryptoPath = process.env.FABRIC_CRYPTO_PATH || '';
const keyDirectoryPath = path.join(cryptoPath, 'keystore');
const certPath = path.join(cryptoPath, 'signcerts', 'cert.pem');
const tlsCertPath = process.env.FABRIC_TLS_CERT_PATH || '';
const peerEndpoint = process.env.FABRIC_PEER_ENDPOINT || 'localhost:7051';
const peerHostAlias = process.env.FABRIC_PEER_HOST_ALIAS || 'peer0.org1.example.com';

async function newGrpcConnection(): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(tlsCertPath /*turbopackIgnore: true*/);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

async function newIdentity(): Promise<Identity> {
    const credentials = await fs.readFile(certPath /*turbopackIgnore: true*/);
    return { mspId, credentials };
}

async function newSigner(): Promise<Signer> {
    const files = await fs.readdir(keyDirectoryPath /*turbopackIgnore: true*/);
    const keyPath = path.resolve(keyDirectoryPath, files[0]);
    const privateKeyPem = await fs.readFile(keyPath /*turbopackIgnore: true*/);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

export async function submitFabricTransaction(record: BlockchainAuditRecord): Promise<string> {
    const client = await newGrpcConnection();
    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    });

    try {
        const network = gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        // submitTransaction returns the payload if any. The txId is internal but accessible if we hook into it.
        // For gateway v1, submitTransaction resolves to Uint8Array.
        // We will just return the verificationId as a reference, or capture the transaction ID if possible.
        // To get the actual transaction ID in fabric-gateway, we can create the transaction first:
        
        const proposal = contract.newProposal('CreateVerification', {
            arguments: [
                record.verificationId,
                record.documentHash,
                record.resultHash,
                record.status,
                record.verificationScore.toString(),
                record.timestamp
            ]
        });
        
        const transaction = await proposal.endorse();
        const txId = transaction.getTransactionId();
        
        console.log(`Submitting Fabric transaction ${txId}...`);
        await transaction.submit();
        console.log('Transaction committed successfully');
        
        return txId;
    } finally {
        gateway.close();
        client.close();
    }
}

export async function verifyFabricIntegrity(verificationId: string, currentHash: string): Promise<IntegrityCheckResponse> {
    const client = await newGrpcConnection();
    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
    });

    try {
        const network = gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        const resultBytes = await contract.evaluateTransaction('VerifyIntegrity', verificationId, currentHash);
        const resultJson = new TextDecoder().decode(resultBytes);
        return JSON.parse(resultJson) as IntegrityCheckResponse;
    } finally {
        gateway.close();
        client.close();
    }
}
