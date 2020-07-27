import axios from "axios";

export default async function getPaymentHistory(accountID, limit, token) {
    try {
        var paymentsArray = [];
        var paymentHistory = await axios.get('https://horizon-testnet.stellar.org/accounts/' + accountID
            + '/payments?limit=' + limit + '&order=desc&include_failed=true');
        const allRecords = paymentHistory.data._embedded.records;
        for (var i = 0; i < allRecords.length; i++) {
            let records = allRecords[i];
            switch (records.type) {
                case 'create_account':
                    continue;
                default:
                    let transaction = {};
                    var nameFrom = '';
                    var nameTo = '';
                    if (records['from'] === "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG") {
                        nameFrom = {data: "AnchorUSD"};
                    } else if (records.to === "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG") {
                        nameTo = {data: "AnchorUSD"};
                    } else {
                        nameFrom = await axios.get('/getUser/' + records['from'],
                            {headers: {
                                Authorization: `Bearer ${token}`
                            }});
                        nameTo = await axios.get('/getUser/' + records.to,
                            {headers: {
                                Authorization: `Bearer ${token}`
                            }});
                    }
                    // console.log([nameFrom, nameTo]);
                    transaction = {
                        amount: records.amount,
                        asset_type: records.asset_type,
                        created_at: records.created_at,
                        'from': records['from'],
                        to: records.to,
                        successful: records.transaction_successful,
                        source_account: records.source_account,
                        transaction_hash: records.transaction_hash,
                        nameFrom: nameFrom.data,
                        nameTo: nameTo.data
                    };
                    if (records.asset_type !== 'native') {
                        transaction.asset_code = records.asset_code;
                        transaction.asset_issuer = records.asset_issuer
                    }
                    paymentsArray.push(transaction);
                }
            }
        return paymentsArray;
    } catch (error) {
        console.log(error);
    }
}
