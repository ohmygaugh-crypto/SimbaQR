var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();
var horizon = new StellarSdk.Server('https://horizon-testnet.stellar.org');

export default async function createTrustline(secretKey, assetCode, assetIssuerAddress) {
    console.log(secretKey);
    console.log(assetCode);
    console.log(assetIssuerAddress);
    var sourceKeys = StellarSdk.Keypair.fromSecret(secretKey);
    const account = await horizon.loadAccount(sourceKeys.publicKey());
    const fee = await horizon.fetchBaseFee();
    let asset = new StellarSdk.Asset(assetCode, assetIssuerAddress);
    console.log(asset);
    let transaction = new StellarSdk.TransactionBuilder(account, {fee: fee})
        .addOperation(StellarSdk.Operation.changeTrust({
            asset: asset,
        }))
        .setTimeout(180)
        .build();
    transaction.sign(sourceKeys);
    console.log(JSON.stringify(transaction));
    await horizon.submitTransaction(transaction);
}