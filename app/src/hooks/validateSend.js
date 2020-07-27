// This dependency will be injected in to the useForm custom hook,
// so, it's up to you to arbitrarily define fields and corresponding
// validations for those fields (e.g. you could simply add a 'Remember Me'
// field and validation if you wish to).
// Precondition: Your fields must use same name e.g. name="password"
var StellarSdk = require('stellar-sdk');

export const fields = [
    'amount',
    'asset',
    'destination',
    'memo',
    'memoType',
];

// Add your validation logic here. It should correspond with a field in fields
export const validate = (values) => {
    let errors = {};
    var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

    // Destination
    if (!values.destination) {
        errors.destination = "Stellar Account ID is required."
    } else if (!StellarSdk.StrKey.isValidEd25519PublicKey(values.destination)) {
        errors.destination = "That Stellar Address is invalid."
    } else if (values.destination && StellarSdk.StrKey.isValidEd25519PublicKey(values.destination)) {
        server.loadAccount(values.destination).catch(StellarSdk.NotFoundError, function () {
            errors.destination = "The destination account does not exist."
        });
    }
    
    // Asset Type
    if (!values.asset) {
        errors.asset = "Asset Type is required."
    }
    
    // Amount
    if (!values.amount) {
        errors.amount = "Please enter an amount."
    } else if (isNaN(values.amount)) {
        errors.amount = "The amount must be a number"
    }

    if (!values.memoType) {
        errors.memoType = "The type of memo is required."
    }
    
    if (!values.memo) {
        errors.memo = "Please add a memo for your transaction."
    }
    
    return errors;
};