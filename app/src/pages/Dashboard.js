import React, {Fragment, useEffect, useState} from 'react';
import {
    CardActions,
    CssBaseline,
    makeStyles,
    MenuItem,
    Divider,
    Select,
    Typography,
    Button,
    FormControl,
    Grid
} from "@material-ui/core";
import VerticalStepper from "../components/VerticalStepper";
import WalletInfo from "../components/WalletInfo";
import AnchorUSDOnBoarding from "../components/AnchorUSDOnBoarding";
import DashboardCard from "../components/DashboardCard";
import FullWidthTabs from "../components/TabPanel";
import RecentTransactionHistory from "../components/RecentTransactionHistory";
import Snackbars from "../components/SnackBars";
import DollarIcon from '@material-ui/icons/AttachMoney';
import axios from 'axios';
import '../styles/style.css'
import { useAuth0 } from "../react-auth0-wrapper";
import submitSimbaApi from "../models/SubmitSimbaApi";

var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();
var horizon = new StellarSdk.Server('https://horizon-testnet.stellar.org');

const useStyles = makeStyles (theme => ({
    grid: {
        padding: theme.spacing(3),
        overflowX: 'hidden',
    },
    formControl: {
        display: "flex"
    }
}));

const Dashboard = props => {
    const classes = useStyles();
    const { getTokenSilently, user } = useAuth0();
    const [anchorUSDModal, setAnchorUSDModal] = useState(false);
    const [anchorUSDURL, setAnchorUSDURL] = useState('');
    const [currencyBalance, setCurrencyBalance] = useState('');
    const [buttonState, setButtonState] = useState(true);
    const [xlmBalance, setXlmBalance] = useState('- -');
    const [trustedBalance, setTrustedBalance] = useState('- -');
    const [refresh, setRefresh] = useState(false);
    const [amount, setAmount] = useState('');
    const [snackbar, setSnackbar] = useState({
        success: false,
        error: false,
        information: false,
        warning: false
    });
    const snackbarOpen = (variant) => {
        setSnackbar(oldValues => ({
            ...oldValues,
            [variant]: true,
        }));
    };
    
    const snackbarClose = (variant) => (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar(oldValues => ({
            ...oldValues,
            [variant]: false,
        }));
    };
    
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
            await axios.get('https://sandbox-api.anchorusd.com/transfer/deposit?account='
                + props.walletPublicKey + '&asset_code=USD&email_address=' +
                encodeURIComponent(process.env.REACT_APP_EMAIL) + '&callback=postMessage');
            
        } catch (error) {
            console.error(error.response);
            const depositURL = error.response.data.url;
            const identifier = error.response.data.identifier;
            console.log(depositURL);
            console.log(identifier);
            setAnchorUSDURL(depositURL);
            setAnchorUSDModal(true);
        }
    }
    
    async function withdrawAnchorUSD() {
        try {
            let res = await axios.get('https://sandbox-api.anchorusd.com/transfer/withdraw?account=' +
                props.walletPublicKey + '&type=bank_account&asset_code=USD&&email_address=' +
                encodeURIComponent(process.env.REACT_APP_EMAIL));
            console.log(res);
        } catch (error) {
            console.log(error.response);
            const depositURL = error.response.data.url;
            const identifier = error.response.data.identifier;
            console.log(depositURL);
            console.log(identifier);
            setAnchorUSDURL(depositURL);
            setAnchorUSDModal(true);
        }
    }
    
    function handleCurrencyChange(event) {
        setCurrencyBalance(event.target.value);
    }

    function handleAmountChange(event) {
        setAmount(event.target.value);
    }

    const resetAmount = () => {
        setAmount('');
    };
    
    const handleRefresh = () => {
        setXlmBalance(xlmBalance - amount - 0.00001);
        setRefresh(!refresh);
    };
    
    useEffect(() => {
        const addUser = async () => {
            const token = await getTokenSilently();
            await axios.post('/addUser', {
                firstName: user.given_name,
                surname: user.family_name,
                email: user.email
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
        };
        addUser();
    }, []);
    
    useEffect(() => {
        const fetchData = async () => {
            if (props.walletPublicKey !== '') {
                let account = await horizon.loadAccount(props.walletPublicKey);
                let balances = account.balances;
                // console.log(balances);
                if (balances.length === 1) {
                    setXlmBalance(balances[0].balance);
                    if (currencyBalance === "") {
                        setTrustedBalance("Please Choose a currency");
                        setButtonState(true);
                    } else {
                        setTrustedBalance('You do not trust this asset');
                        setButtonState(true);
                    }
                } else {
                    for (var i = 0; i < balances.length; i++) {
                        let currency = balances[i];
                        if (currency.asset_type === 'native') {
                            setXlmBalance(currency.balance);
                        } else if (currency.asset_code === 'USD') {
                            setTrustedBalance("$ " + currency.balance);
                        }
                    }
                    if (currencyBalance === '') {
                        setTrustedBalance("Please Choose a currency");
                        setButtonState(true);
                    } else {
                        setButtonState(false);
                    }
                }

            }
        };
        fetchData();
    }, [props.walletPublicKey, currencyBalance]);
    
    return (
        <Fragment>
            <CssBaseline/>
            <div className={classes.grid}>
                <Grid container spacing={5}>
                    <Grid item xs={6}>
                        <DashboardCard
                            title={<Typography style={{color: "white"}}
                                               variant={"h6"}>{"Wallet Information"}</Typography>}
                            content={
                                <WalletInfo
                                    walletName={props.walletName}
                                    walletPublicKey={props.walletPublicKey}
                                    walletSeed={props.walletSeed}
                                />
                            }
                            actions={
                                <div>
                                    <Divider/>
                                    <CardActions style={{paddingLeft: 16}} disableSpacing={true}>
                                        <Typography variant={'subtitle1'}>Balance: {xlmBalance + " XLM"}</Typography>
                                    </CardActions>
                                </div>
                            }
                        />
                    </Grid>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={4}>
                        <DashboardCard
                            height={180}
                            title={<Typography style={{color: "white"}} variant={"h6"}>Trusted Assets</Typography>}
                            content={<Typography variant={"h5"}>{trustedBalance}</Typography>}
                            actions={
                                <div>
                                    <Divider/>
                                    <CardActions disableSpacing={false}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={4}>
                                                <FormControl fullWidth={true} className={classes.formControl}>
                                                    <Select
                                                        value={currencyBalance}
                                                        onChange={handleCurrencyChange}
                                                        name="Currency"
                                                        displayEmpty
                                                        className={classes.selectEmpty}
                                                    >
                                                        <MenuItem value="" disabled>Choose a currency</MenuItem>
                                                        <MenuItem value={"USD"}>USD (AnchorUSD)</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Button disabled={buttonState} fullWidth={true} size={"small"}
                                                        variant="contained"
                                                        color="primary" className={classes.button}
                                                        onClick={depositAnchorUSD}>
                                                    Deposit
                                                    <DollarIcon className={classes.rightIcon}/>
                                                </Button>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Button disabled={buttonState} fullWidth={true} size={"small"}
                                                        variant="contained"
                                                        color="primary" className={classes.button}
                                                        onClick={withdrawAnchorUSD}>
                                                    Withdraw
                                                    <DollarIcon className={classes.rightIcon}/>
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </CardActions>
                                </div>
                            }
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <DashboardCard
                            height={"auto"}
                            title={<Typography style={{color: "white"}} variant={"h6"}>Make a Payment</Typography>}
                            content={
                                <FullWidthTabs
                                    someoneNew={
                                        <VerticalStepper
                                            status={true}
                                            walletName={props.walletName}
                                            walletPublicKey={props.walletPublicKey}
                                            walletSeed={props.walletSeed}
                                            refreshState={refresh}
                                            handleRefresh={handleRefresh}
                                            amount={amount}
                                            setAmount={handleAmountChange}
                                            resetAmount={resetAmount}
                                            snackbar={snackbarOpen}
                                        />
                                    }
                                    paidBefore={
                                        <VerticalStepper
                                            status={false}
                                            walletName={props.walletName}
                                            walletPublicKey={props.walletPublicKey}
                                            walletSeed={props.walletSeed}
                                            refreshState={refresh}
                                            handleRefresh={handleRefresh}
                                            amount={amount}
                                            setAmount={handleAmountChange}
                                            resetAmount={resetAmount}
                                            snackbar={snackbarOpen}
                                        />
                                    }
                                />
                            }
                        />
                    </Grid>
                    <Grid item xs={2}></Grid>
                    <Grid item xs={4}>
                        <DashboardCard
                            height={'auto'}
                            title={
                                <Typography style={{color: "white"}} variant={"h6"}>
                                    Most Recent Transactions
                                </Typography>
                            }
                            content={
                                <RecentTransactionHistory
                                    walletPublicKey={props.walletPublicKey}
                                    refreshState={refresh}
                                    handleRefresh={handleRefresh}
                                />
                            }
                        />
                    </Grid>
                </Grid>
            </div>
            <AnchorUSDOnBoarding
                url={anchorUSDURL}
                open={anchorUSDModal}
                onClose={toggleModals(false, 'anchorUSD')}
            />
            <Snackbars
                open={snackbar.success}
                onClose={snackbarClose("success")}
                message={"Payment Successful!"}
                variant={"success"}
            />
            <Snackbars
                open={snackbar.error}
                onClose={snackbarClose("error")}
                message={"Payment Failed!"}
                variant={"error"}
            />
        </Fragment>
    );
};

export default Dashboard;

