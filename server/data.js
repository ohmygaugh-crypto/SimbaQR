const path = require("path");
const Sequelize = require('sequelize');
const config = require("config");
// const moment = require("moment");

const sequelize = new Sequelize("SimbaPayDB", null, null, config.get("DB"));

sequelize.authenticate().then(
    function() {
        console.log("Connection has been established successfully.");
    },
    function(err) {
        console.log("Unable to connect to the database:", err);
    }
);

const User = sequelize.define(
    "User", {
        firstName: Sequelize.STRING,
        surname: Sequelize.STRING,
        email: Sequelize.STRING,
        sub: {
            type: Sequelize.STRING,
            allowNull: false
        },
    },
    {timestamps: false, freezeTableName: true}
);

const Wallet = sequelize.define(
    "Wallet", {
        publicKey: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {timestamps: false, freezeTableName: true}
);

const Trustline = sequelize.define(
    "Trustline", {
        name: Sequelize.STRING,
        publicKey: Sequelize.STRING,
        assetCode: Sequelize.STRING,
        assetType: Sequelize.STRING,
    }, {timestamps: false, freezeTableName: true}
);

const WalletTrustline = sequelize.define(
    "WalletTrustline", {
        TrustlineId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Trustline',
                key: 'id'
            },
        },
        WalletId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Wallet',
                key: 'id'
            },
        }
    }, {timestamps: false, freezeTableName: true}
);

const Contacts = sequelize.define(
    'Contacts', {
        name: {
            type: Sequelize.STRING
        },
        extraInfo: {
            type: Sequelize.STRING
        },
        publicKey: {
            type: Sequelize.STRING
        }
    }, {timestamps: false, freezeTableName: true}
);

User.hasMany(Wallet);
User.hasMany(Contacts);

// User.belongsToMany(Wallet, { through: { model: Payee, as: "UserId"} });
// Wallet.belongsToMany(User, { through: { model: Payee, as: "WalletId"} });

// Payee.belongsTo(User);
// Payee.belongsTo(Wallet);

WalletTrustline.belongsTo(Wallet);
WalletTrustline.belongsTo(Trustline);

Trustline.belongsToMany(Wallet, { through: WalletTrustline });
Wallet.belongsToMany(Trustline, { through: WalletTrustline });

const initialiseDatabase = function(wipeAndClear, repopulate) {
    sequelize.sync({ force: wipeAndClear }).then(
        function() {
            console.log("Database Synchronised");
            if (repopulate) {
                repopulate();
            }
        },
        function(err) {
            console.log("An error occurred while creating the tables:", err);
        }
    );
};

module.exports = {
    Trustline,
    User,
    Wallet,
    // UserWallet,
    Contacts,
    WalletTrustline,
    initialiseDatabase,
    sequelize
};
