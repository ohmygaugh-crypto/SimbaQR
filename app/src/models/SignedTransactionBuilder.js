var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();
var horizon = new StellarSdk.Server('https://horizon-testnet.stellar.org');

export default async function BuildSignedTransaction(destinationId, destinationAmount, maxSend, secretKey) {
    var sourceKeys = StellarSdk.Keypair.fromSecret(secretKey);
    const account = await horizon.loadAccount(sourceKeys.publicKey());
    const fee = await horizon.fetchBaseFee();
    const transaction = new StellarSdk.TransactionBuilder(account, { fee })
        .addOperation(StellarSdk.Operation.pathPayment({
            sendAsset: StellarSdk.Asset.native(),
            sendMax: maxSend,
            destination: destinationId,
            destAsset: StellarSdk.Asset.native(),
            destAmount: destinationAmount,
            path: []
        }))
        .setTimeout(180)
        .build();
    transaction.sign(sourceKeys);
    return transaction;
}


