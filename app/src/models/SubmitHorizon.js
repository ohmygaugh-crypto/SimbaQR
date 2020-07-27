import BuildSignedTransaction from "./SignedTransactionBuilder";
var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();
var horizon = new StellarSdk.Server('https://horizon-testnet.stellar.org');
async function submitHorizon(values) {
    try {
        let transaction = await BuildSignedTransaction(values.destination, values.destinationAmount, values.maxSendAmount, 'SCMAJSSFEQWKFREK4IVJ7A4ZZRQDIJVKUJSKEYIN2QOGJU2VEZ2FLEIT');
        return await horizon.submitTransaction(transaction);
    } catch (error) {
        console.error('Error in submitHorizon: ' + error);
    }
}