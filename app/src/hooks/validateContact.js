var StellarSdk = require('stellar-sdk');

export const fields = [
    'id',
    'name',
    'extraInfo',
    'publicKey',
];

export const validate = (values) => {
    let errors = {};
    var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    if (!values.publicKey) {
        errors.publicKey = "Stellar Account ID is required."
    } else if (!StellarSdk.StrKey.isValidEd25519PublicKey(values.publicKey)) {
        errors.publicKey = "That Stellar Address is invalid."
    } else if (values.publicKey && StellarSdk.StrKey.isValidEd25519PublicKey(values.publicKey)) {
        server.loadAccount(values.publicKey).catch(StellarSdk.NotFoundError, function (error) {
            errors.publicKey = "The destination account does not exist."
        });
    }
    return errors;
};