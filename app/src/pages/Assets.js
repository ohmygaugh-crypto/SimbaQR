import React, {useState, useEffect} from 'react';
import { useAuth0 } from "../react-auth0-wrapper";
import { Grid, Typography, makeStyles, Button, Box } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import axios from 'axios';
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import AnchorUSDOnBoarding from "../components/AnchorUSDOnBoarding";
import submitSimbaApi from "../models/SubmitSimbaApi";

var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();
var horizon = new StellarSdk.Server('https://horizon-testnet.stellar.org');

const useStyles = makeStyles(theme => ({
    grid: {
        padding: theme.spacing(3),
        overflowX: 'hidden',
    },
    card: {
        position: 'relative'
    },
    button: {
        marginRight: 6
    },
    buttonBox: {
        marginLeft: theme.spacing(0.5),
    },
    xlmBalance: {
        position: 'absolute',
        right: '5%',
        top: '30%'
    },
    balances: {
        position: 'absolute',
        right: '5%',
        top: '35%'
    }
}));

const Assets = props => {
    const classes = useStyles();
    const [trustStatus, setTrustStatus] = useState({});
    const [assets, setAssets] = useState([]);
    const [disabled, setDisabled] = useState(true);
    const { getTokenSilently, user } = useAuth0();
    const [anchorUSDModal, setAnchorUSDModal] = useState(false);
    const [anchorUSDURL, setAnchorUSDURL] = useState('');
    const [lumens, setLumens] = useState();
    const [currencies, setCurrencies] = useState({
        'AnchorUSD': null
    });
    
    const toggleModals = (open, modal) => event => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        switch (modal) {
            case 'wallet':
                // setWalletModal(open);
                break;
            case 'anchorUSD':
                setAnchorUSDModal(open);
                break;
            default:
                console.log(modal);
        }
    };
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getTokenSilently();
                const result = await axios.get('/getTrustlines', {headers: {
                        Authorization: `Bearer ${token}`
                    }});
                console.log(result);
                setAssets(result.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, []);
    
    const changeTrust = (seed, issuerID, assetCode, assetType, revoke, trustlineKey) => async (event) => {
        if (seed !== "Choose a Stellar Wallet") {
            let payload = {};
            const sourceKeys = StellarSdk.Keypair.fromSecret(seed);
            const token = await getTokenSilently();
            if (!revoke) {
                payload = {
                    operations: [{
                        type: "change_trust",
                        asset: {
                            assetCode: assetCode,
                            issuerAccount: issuerID,
                            type: assetType,
                        }
                    }],
                    sourceAccount: sourceKeys.publicKey()
                };
            } else {
                payload = {
                    operations: [{
                        type: "change_trust",
                        asset: {
                            assetCode: assetCode,
                            issuerAccount: issuerID,
                            type: assetType,
                        },
                        limit: '0'
                    }],
                    sourceAccount: sourceKeys.publicKey()
                };
            }
            try {
                let axiosConfig = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
                let res = await axios.post('/changeTrust/execute/', payload, axiosConfig);
                let transaction = new StellarSdk.Transaction(res.data.payload.raw.xdr);
                let transactionID = res.data.id;
                transaction.sign(sourceKeys);
                let xdrString = transaction.toEnvelope().toXDR('base64');
                await axios.post('/changeTrust/transaction/' + transactionID + '/',
                    {
                        payload: xdrString
                    }, axiosConfig
                );
            } catch (error) {
                console.log('Error in submitting to Simba Chain in changeTrust: ' + error);
            }
            try {
                if (!revoke) {
                    await axios.post('/addTrust/' + issuerID + '/' + sourceKeys.publicKey(), {}, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setTrustStatus(oldValues => ({
                        ...oldValues,
                        [trustlineKey]: true,
                    }));
                } else {
                    await axios.post('/revokeTrust/' + sourceKeys.publicKey() + '/' + issuerID, {}, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        }
                    });
                    setTrustStatus(oldValues => ({
                        ...oldValues,
                        [trustlineKey]: false,
                    }));
                }
            } catch (error) {
                console.log(error);
            }
        }
    };
    
    useEffect(() => {
        const trustRevoke = async () => {
            if (props.walletSeed !== "Choose a Stellar Wallet") {
                const token = await getTokenSilently();
                try {
                    const publicKey = props.walletPublicKey;
                    let res = await axios.get('/getUserTrustlineInfo/' + publicKey, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    console.log(res.data);
                    let jsonTrust = {};
                    res.data.forEach((trustline) => {
                        let trustlineID = trustline.id.toString();
                        jsonTrust[trustlineID] = true;
                    });
                    setTrustStatus(jsonTrust);
                } catch (error) {
                    console.log(error);
                }
                setDisabled(false);
            }
        };
        trustRevoke();
    }, [props.walletPublicKey]);
    
    useEffect(() => {
        window.addEventListener("message", receiveMessage, false);
    });
    
    function receiveMessage (event) {
        if (event.origin !== "https://sandbox-portal.anchorusd.com") {
            return;
        }
        // document.getElementById("message").innerHTML = 'Success';
        var data = JSON.parse(event.data);
        if (data.status === 'success' && data.type === 'withdraw') {
            let sourceKeys = StellarSdk.Keypair.fromSecret(props.walletSeed);
            let payload = {
                memo: {type: data.memo_type, value: data.memo},
                operations:[{
                    amount: data.amount,
                    asset: {
                        assetCode: 'USD',
                        type: 'alphanumeric4',
                        issuerAccount: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG"
                    },
                    type: 'payment'
                }],
                sourceAccount: props.walletPublicKey
            };
            submitSimbaApi(payload, sourceKeys).then(() => {
                setAnchorUSDModal(false);
            })
        }
    }
    
    async function depositAnchorUSD() {
        console.log(user.email);
        try {
            await axios.get(`https://sandbox-api.anchorusd.com/transfer/deposit?account=${props.walletPublicKey}&asset_code=USD&email_address=${encodeURIComponent('example@example.com')}`);
            
        } catch (error) {
            console.error(error.response);
            const depositURL = `${error.response.data.url}&callback=postMessage`;
            const identifier = error.response.data.identifier;
            console.log(depositURL);
            console.log(identifier);
            setAnchorUSDURL(depositURL);
            setAnchorUSDModal(true);
        }
    }
    
    async function withdrawAnchorUSD() {
        try {
            await axios.get('https://sandbox-api.anchorusd.com/transfer/withdraw?account=' +
                props.walletPublicKey + '&type=bank_account&asset_code=USD&&email_address=' +
                encodeURIComponent('example@example.com'));
        } catch (error) {
            const depositURL = error.response.data.url;
            const identifier = error.response.data.identifier;
            console.log(depositURL);
            console.log(identifier);
            setAnchorUSDURL(depositURL);
            setAnchorUSDModal(true);
        }
    }
    
    useEffect(() => {
        const fetchData = async () => {
            if (props.walletPublicKey !== '') {
                let account = await horizon.loadAccount(props.walletPublicKey);
                let balances = account.balances;
                console.log(balances)
                if (balances.length === 1) {
                    setLumens(balances[0].balance);
                    setCurrencies(oldValues => ({
                        ...oldValues, 'AnchorUSD': null,
                    }))
                } else {
                    for (var i = 0; i < balances.length; i++) {
                        let currency = balances[i];
                        if (currency.asset_type === 'native') {
                            setLumens(currency.balance);
                        } else if (currency.asset_issuer === 'GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG') {
                            let anchorName = 'AnchorUSD';
                            setCurrencies(oldValues => ({
                                ...oldValues,
                                [anchorName]: currency.balance,
                            }));
                        }
                    }
                }
            }
        };
        fetchData();
    }, [props.walletPublicKey]);
    
    function createAssetCards(asset, seed) {
        return (
            <Grid item xs={12} key={asset.id}>
                <Card className={classes.card}>
                    <CardContent>
                        <Typography variant="h6" color="textPrimary" component="p">
                            {asset.name} ({asset.assetCode})
                        </Typography>
                        <Typography variant="subtitle2" color="textSecondary" component="p">
                            {asset.publicKey}
                        </Typography>
                        <Typography className={classes.balances} variant={"h5"} color={"textPrimary"} component="p">
                            {currencies[asset.name]}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Box className={classes.buttonBox} component="div" display="inline">
                            {trustStatus[asset.id.toString()] ?
                                <Button value={asset.id.toString()} disabled={disabled} size={"small"} variant="contained" color="secondary" className={classes.button}
                                        onClick={changeTrust(seed, asset.publicKey, asset.assetCode, asset.assetType,true, asset.id.toString())}>{disabled ? 'Choose a Stellar Wallet' : 'Revoke Trust' }</Button> :
                                <Button value={asset.id.toString()} disabled={disabled} size={"small"} variant="contained" color="primary" className={classes.button}
                                        onClick={changeTrust(seed, asset.publicKey, asset.assetCode, asset.assetType,false, asset.id.toString())}>{ disabled ? 'Choose a Stellar Wallet' : 'Trust Asset'}</Button>
                            }
                            <Button disabled={disabled} fullWidth={false} size={"small"}
                                    variant="contained"
                                    color="primary" className={classes.button}
                                    onClick={withdrawAnchorUSD}
                                >
                                Redeem
                            </Button>
                            <Button disabled={disabled} fullWidth={false} size={"small"}
                                    variant="contained"
                                    color="primary" className={classes.button}
                                    onClick={depositAnchorUSD}
                                >
                                Acquire
                            </Button>
                        </Box>
                    </CardActions>
                </Card>
            </Grid>
        );
    }
    
    return (
        <div className={classes.grid}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card className={classes.card}>
                        <CardContent>
                            <Typography variant="h6" color="textPrimary" component="p">
                                {"Stellar Lumens"} ({"XLM"})
                            </Typography>
                            <Typography className={classes.xlmBalance} variant={"h5"} color={"textPrimary"} component="p">
                                {props.walletPublicKey !== '' ? lumens : null}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                {assets.map(asset => {
                    return createAssetCards(asset, props.walletSeed);
                })}
            </Grid>
            <AnchorUSDOnBoarding
                url={anchorUSDURL}
                open={anchorUSDModal}
                onClose={toggleModals(false, 'anchorUSD')}
            />
        </div>
        
    );
};

export default Assets;