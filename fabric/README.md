# VerifyX Hyperledger Fabric Blockchain Anchoring

This directory contains the smart contracts (chaincode) and configuration required to anchor VerifyX audit logs immutably onto a Hyperledger Fabric ledger. 

**Note: The main Next.js app is completely decoupled and will function perfectly even if the blockchain network is not running (it will display "Blockchain: Pending/Unavailable").**

## 1. Prerequisites

You must have the official Hyperledger Fabric `test-network` installed and running to test this locally.
Follow the official documentation to install the binaries and Docker images:
https://hyperledger-fabric.readthedocs.io/en/latest/getting_started.html

## 2. Start the Network

Navigate to your `fabric-samples/test-network` directory:

```bash
# Tear down any old network
./network.sh down

# Bring up the network with CouchDB and create a channel
./network.sh up createChannel -c mychannel -s couchdb
```

## 3. Deploy the VerifyX Chaincode

Run the following command from the `test-network` directory, pointing to the path of this `verifyx` chaincode folder:

```bash
./network.sh deployCC -ccn verifyx -ccp /path/to/VerifyX/verifyx/fabric/chaincode/verifyx -ccl typescript
```

## 4. Configure Next.js Application

In the VerifyX root directory, edit your `.env.local`:

1. Change `FABRIC_ENABLED=true`
2. Set the `FABRIC_CRYPTO_PATH` and `FABRIC_TLS_CERT_PATH` to point to the absolute paths of the generated crypto materials inside `fabric-samples/test-network`. Check `.env.example` for the specific directory structure required.

## 5. Test

Run `npm run dev` in the VerifyX root. Next time you verify a document, you will see a transaction ID and a "Verify Cryptographic Integrity" button!
