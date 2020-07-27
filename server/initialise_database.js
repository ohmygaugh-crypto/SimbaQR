const path = require("path");
const Sequelize = require("sequelize");
const db = require("./data");

// Add some dummy data to the database - in practice this should be in a different file
function addData() {
    let trustLine1 = db.Trustline.create({
        name: "AnchorUSD",
        publicKey: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG",
        assetCode: "USD",
        assetType: 'alphanumeric4'
    });
    // Promise.all([user1, user2, wallet1, wallet2, wallet3, wallet4, trustLine1])
    Promise.all([trustLine1]).then((results) => {
        // let u1 = results[0];
        // let u2 = results[1];
        // let w1 = results[2];
        // let w2 = results[3];
        // let w3 = results[4];
        // let w4 = results[5];
        let t1 = results[6];
        // u1.addWallet(w1);
        // u1.addWallet(w2);
        // u1.addWallet(w3);
        // u2.addWallet(w4);
        // w1.addTrustline(t1);
        // w2.addTrustline(t1);
        // w3.addTrustline(t1);
    });
}

db.initialiseDatabase(false, addData());
// db.initialiseDatabase(true);
