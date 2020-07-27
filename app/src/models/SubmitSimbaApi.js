import axios from "axios";

var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();


export default async function submitSimbaApi(values, seed, publicKey, token) {
    let axiosConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
    try {
        let sourceKeys = StellarSdk.Keypair.fromSecret(seed);
        let payload = {
            operations:[{
                amount: values.amount,
                destination: values.destination,
                type: 'payment'
            }],
            sourceAccount: publicKey
        };
        if (values.memoType !== 'none') {
            payload['memo'] = {type: values.memoType, value: values.memo};
        }
        if (values.asset !== 'native') {
            payload.operations[0].asset = {assetCode: 'USD', type: 'alphanumeric4', issuerAccount: values.asset};
        } else {
            payload.operations[0].asset = {type: values.asset};
        }
        let res = await axios.post(
            '/singleCurrencyPayment/execute/', payload, axiosConfig
        );
        console.log(res);
        let transaction = new StellarSdk.Transaction(res.data.payload.raw.xdr);
        let transactionID = res.data.id;
        transaction.sign(sourceKeys);
        let xdrString = transaction.toEnvelope().toXDR('base64');
        return await axios.post(
            `/singleCurrencyPayment/transaction/${transactionID}/`,
            { payload: xdrString }, axiosConfig
        );
    } catch (error) {
        console.log('Error in submitSimbaApi: ' + error);
    }
}