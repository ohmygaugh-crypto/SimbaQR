require('dotenv').config();
const express = require('express');
const compression = require('compression');
const path = require('path');
const app = express();
const db = require("./data");
const Sequelize = require('sequelize');
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const Op = Sequelize.Op;
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const axios = require("axios");
const config = require("config");

const bunyan = require('bunyan');
const logger = bunyan.createLogger({name:"app.js"});

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

class SimbaPayError extends Error {
    constructor(message, code){
        super(message);
        this.code = code;
    }
}

app.use(express.static(__dirname + "/../app/build/")); //serves the index.html

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + "/../app/build/index.html"));
});

// app.get('/dashboard', function(req, res) {
//     res.sendFile(path.join(__dirname + "/../app/build/index.html"));
// });

app.get('/send', function(req, res) {
    res.sendFile(path.join(__dirname + "/../app/build/index.html"));
});

app.get('/receive', function(req, res) {
    res.sendFile(path.join(__dirname + "/../app/build/index.html"));
});

app.get('/qr_code', function(req, res) {
    res.sendFile(path.join(__dirname + "/../app/build/index.html"));
});

app.get('/contacts', function(req, res) {
    res.sendFile(path.join(__dirname + "/../app/build/index.html"));
});

app.get('/transaction_history', function(req, res) {
    res.sendFile(path.join(__dirname + "/../app/build/index.html"));
});

app.get('/assets', function(req, res) {
    res.sendFile(path.join(__dirname + "/../app/build/index.html"));
});

app.get('/wallets', function(req, res) {
    res.sendFile(path.join(__dirname + "/../app/build/index.html"));
});

// Set up Auth0 configuration
const authConfig = {
    domain: process.env.AUTH0_DOMAIN, // Your Auth0 Domain e.g. - example.auth0.com - that you have configured on https://auth0.com/
    audience: process.env.AUTH0_AUDIENCE // Your Auth0 Audience e.g. - https://api.example.com/v1 - that you have configured on https://auth0.com/
}

// Define middleware that validates incoming bearer tokens
// using JWKS from simbachain-dev.auth0.com
const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
    }),
    
    audience: authConfig.audience,
    issuer: `https://${authConfig.domain}/`,
    algorithm: ["RS256"]
});

app.post('/changeTrust/execute/', checkJwt, (req, res, next) => {
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json',
            'APIKEY': process.env.CHANGE_TRUST, // Your API Key for your SIMBA Chain Change Trust API
        }
    };
    console.log(req.body);
    // Replace url with your simba chain api url and api name
    axios.post('https://your-simbachain-api.com/v1/yourAPIName/execute/', req.body, axiosConfig)
        .then(data=>res.status(data.status).json(data.data))
        .catch(next);
});

app.post('/changeTrust/transaction/:txnID/', checkJwt, (req, res, next) => {
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json',
            'APIKEY': process.env.CHANGE_TRUST, // Your API Key for your SIMBA Chain Change Trust API
        }
    };
    console.log(req.body);
    // Replace url with your simba chain api url and api name
    axios.post(`https://your-simbachain-api.com/v1/yourAPIName/transaction/${req.params.txnID}/`, req.body, axiosConfig)
        .then(data=>res.status(data.status).json(data.data))
        .catch(next);
});

app.post('/singleCurrencyPayment/execute/', checkJwt, (req, res, next) => {
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json',
            'APIKEY': process.env.PAYMENT, // Your API Key for your SIMBA Chain Payment API
        }
    };
    console.log(req.body);
    // Replace url with your simba chain api url and api name
    axios.post('https://your-simbachain-api.com/v1/yourAPIName/execute/', req.body, axiosConfig)
        .then(data => res.status(data.status).json(data.data))
        .catch(next);
});

app.post('/singleCurrencyPayment/transaction/:txnID/', checkJwt, (req, res, next) => {
    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json',
            'APIKEY': process.env.PAYMENT, // Your API Key for your SIMBA Chain Payment API
        }
    };
    console.log(req.body);
    // Replace url with your simba chain api url and api name
    axios.post(`https://your-simbachain-api.com/v1/yourAPIName/transaction/${req.params.txnID}/`, req.body, axiosConfig)
        .then(data => res.status(data.status).json(data.data))
        .catch(next);
});

app.post("/receive/:publicKey/:asset/:amount/:memoType/:memo", (req, res) => {
    const payload = {
        destination: req.params.publicKey,
        asset: req.params.asset,
        amount: req.params.amount,
        memoType: req.params.memoType,
        memo: req.params.memo
    };
    res.status(200).json(payload);
});


app.get('/getTrustlines', checkJwt, (req, res, next) => {
    db.Trustline.findAll().then((trustlines) => {
        if (trustlines) {
            logger.info({trustlines}, "trustlines");
            res.status(200).json(trustlines);
        }
    }).catch(next);
});

app.get('/getUserTrustlineInfo/:publicKey', checkJwt, (req, res, next) => {
    if (req.params.publicKey === "Choose a Stellar Wallet") {
        next(new SimbaPayError("Choose a Stellar Wallet", 400));
    } else {
        db.Trustline.findAll({
            include: [{
                model: db.Wallet,
                where: { publicKey: req.params.publicKey },
                required: true
            }],
        }).then((trustlines) => {
            if (trustlines) {
                logger.info({trustlines}, "userTrustlines");
                res.status(200).json(trustlines);
            }
        }).catch(next);
    }
});

app.get('/getUser/:publicKey', checkJwt, (req, res, next) => {
    if (req.params.publicKey === 'Choose a Stellar Wallet') {
        next(new SimbaPayError("Choose a Stellar Wallet", 400));
    } else {
        db.Wallet.findOne({
            where: { publicKey: req.params.publicKey }
        }).then((wallet) => {
            if (wallet) {
                db.User.findOne({
                    where: { id: wallet.UserId }
                }).then((user) => {
                    if (user) {
                        res.status(200).send(user.email);
                    }
                }).catch(next);
            } else if (wallet === null) {
                res.status(200).send(req.params.publicKey);
            }
        }).catch(next);
    }
});

app.post('/sendEmail', checkJwt, (req, res, next) => {
    db.User.findOne({
        include: {
            model: db.Wallet,
            where: {publicKey: req.body.publicKey}
        }
    }).then((user) => {
        var transporter = nodemailer.createTransport(config.get("Email.nodemailer"));
        if (user) {
            let mailOptions = {
                'from': config.get("Email.from"),
                to: user.email,
                subject: "You've received money!",
                text: req.body.text
            };
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    logger.error({error}, "error");
                    next(error);
                } else {
                    logger.info({info}, "Email sent: " + info.response);
                    res.status(200).send('Email Sent');
                }
            })
        } else {
            let mailOptions = {
                'from': config.get("Email.from"),
                to: req.body.email,
                subject: "You've received money!",
                text: req.body.text,
            };
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    logger.error({error}, "error");
                    next(error);
                } else {
                    logger.info({info}, "Email sent: " + info.response);
                    res.status(200).send('Email Sent');
                }
            })
        }
    });

});

app.post('/addWallet', checkJwt, (req, res, next) => {
    db.User.findOne({
        where: { sub: req.user.sub }
    }).then((user) => {
        if (user) {
            db.Wallet.findOrCreate({
                where: {
                    publicKey: req.body.publicKey,
                    UserId: user.id
                }
            }).then((wallet) => {
                if (wallet) {
                    res.status(200).send(wallet);
                }
            }).catch(next);
        }
    }).catch(next);
});

app.post('/getContacts', checkJwt, (req, res, next) => {
    db.User.findOne({
        where: {sub: req.user.sub}
    }).then((user) => {
        if (user) {
            db.Contacts.findAll({
                where: { UserId: user.id },
            }).then((contact) => {
                if (contact) {
                    res.status(200).json(contact);
                }
            }).catch(next);
        }
    }).catch(next);
});

app.post('/createContact', checkJwt, (req, res, next) => {
    db.User.findOne({
        where: {sub: req.user.sub}
    }).then((user) => {
        if (user) {
            db.Contacts.create({
                name: req.body.name,
                extraInfo: req.body.extraInfo,
                publicKey: req.body.publicKey,
                UserId: user.id
            }).then((contact) => {
                if (contact) {
                    res.status(200).json(contact);
                }
            }).catch(next);
        }
    }).catch(next);
});

app.post('/editContact', checkJwt, (req, res, next) => {
    db.Contacts.findByPk(req.body.id).then((contact) => {
        if (contact) {
            contact.update({
                name: req.body.name,
                extraInfo: req.body.extraInfo,
                publicKey: req.body.publicKey
            }).then(() => {
                res.status(200).json(contact)
            }).catch(next);
        }
    }).catch(next);
});

app.post('/addPayee', checkJwt, (req, res, next) => {
    db.User.findOne({
        where: { sub: req.user.sub }
    }).then((user) => {
        if (user) {
            db.Wallet.findOne({
                where: { publicKey: req.body.publicKey }
            }).then((wallet) => {
                if (wallet) {
                    db.Payee.findOrCreate({
                        where: {
                            UserId: user.id,
                            WalletId: wallet.id
                        }
                    }).then(() => {
                        logger.info("success");
                        res.sendStatus(200);
                    }).catch((error) => {
                        logger.error({error}, "error");
                        next(error);
                    });
                } else {
                    res.sendStatus(200);
                }
            }).catch(next)
        }
    }).catch(next)
});

app.post('/addUser', checkJwt, (req, res, next) => {
    db.User.findOrCreate({
        where: {
            firstName: req.body.firstName || null,
            surname: req.body.surname || null,
            email: req.body.email,
            sub: req.user.sub
        }
    }).then((user) => {
        if (user) {
            res.status(200).json({success: true, message: 'User found/created'})
        } else {
            next(new SimbaPayError("UserNotFound", 404))
        }
    }).catch(next);
});

app.post("/addTrust/:issuerID/:publicKey", checkJwt, (req, res, next) => {
    if (req.params.publicKey === "Choose a Stellar Wallet") {
        res.status(400).json( { success: false, message: 'Choose a Stellar Wallet' } )
    } else {
        db.Wallet.findOne({
            where: { publicKey: req.params.publicKey }
        }).then((wallet) => {
            if (wallet) {
                db.Trustline.findOne({
                    where: { publicKey: req.params.issuerID }
                }).then((trustline) => {
                    if (trustline) {
                        wallet.addTrustline(trustline);
                        res.status(200).json({ success: true })
                    }
                }).catch(next);
            }
        }).catch(next);
    }
});

app.post("/revokeTrust/:publicKey/:issuerID", checkJwt, (req, res, next) => {
    if (req.params.publicKey === "Choose a Stellar Wallet") {
        res.status(400).json( { success: false, message: 'Choose a Stellar Wallet' } )
    } else {
        db.Wallet.findOne({
            where: { publicKey: req.params.publicKey }
        }).then((wallet) => {
            if (wallet) {
                db.Trustline.findOne({
                    where: { publicKey: req.params.issuerID }
                }).then((trustline) => {
                    if (trustline) {
                        wallet.removeTrustline(trustline);
                        res.status(200).json({ success: true })
                    }
                }).catch(next);
            }
        }).catch(next);
    }
});

//Error Handler
app.use((err, req, res, next) => {
    
    logger.error(err, `Handling error`);
    let body = {
        success: false,
        failed: "Unknown Error",
        code: -1
    };
    
    if(err.message) body.failed = err.message;
    if(err.error_code) body.code = err.error_code;
    if(err.code) body.code = err.code;
    
    let errCode = err.status || err.statusCode || 500;
    
    if (errCode < 400) {
        errCode = 500;
    }
    
    body.status = errCode;
    
    res.status(errCode);
    logger.error({error: body}, "Handling error");
    res.json(body);
});

app.listen(config.get("Server.port"), () => {
    console.log(`Proxy Listening on http://localhost:${config.get("Server.port")}/`)
});