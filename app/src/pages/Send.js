import React, {Fragment, useEffect, useState} from 'react';
import {
    Card,
    CardContent,
    CssBaseline,
    makeStyles,
    Typography,
} from "@material-ui/core";
import SendForm from "../components/SendForm";
import DashboardCard from "../components/DashboardCard";
import Snackbars from "../components/SnackBars";
import axios from 'axios';
import '../styles/style.css'
import { useAuth0 } from "../react-auth0-wrapper";
import FullWidthTabs from "../components/TabPanel";

var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();
var horizon = new StellarSdk.Server('https://horizon-testnet.stellar.org');

const useStyles = makeStyles (theme => ({
    cards: {
        // paddingLeft: theme.spacing(50),
        // paddingRight: theme.spacing(10),
        // paddingTop: theme.spacing(10),
        // paddingBottom: theme.spacing(10),
        width: theme.spacing(90),
        // width: 'auto',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: theme.spacing(5),
        overflowX: 'hidden',
    },
    formControl: {
        display: "flex"
    },
    makePayment: {
        marginTop: theme.spacing(5)
    }
}));

const Send = props => {
    
    const classes = useStyles();
    const {getTokenSilently, user} = useAuth0();
    const [lumens, setLumens] = useState("- -");
    const [currencies, setCurrencies] = useState({
        'AnchorUSD': "- -"
    });
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
    
    return (
        <Fragment>
            <CssBaseline/>
            <div className={classes.cards}>
                <Typography variant={"h2"} color='secondary' style={{marginTop: '5vh'}}>Balance</Typography>
                <Card style={{height: 120, marginTop: 10,}}>
                    <FullWidthTabs
                        firstLabel={"XLM"}
                        secondLabel={"AnchorUSD"}
                        someoneNew={
                            <CardContent>
                                <Typography variant={"h4"}>{lumens + " XLM"}</Typography>
                            </CardContent>
                        }
                        paidBefore={
                            <CardContent>
                                <Typography variant={"h4"}>{"$ " + currencies.AnchorUSD}</Typography>
                            </CardContent>
                        }
                    />
                </Card>
                <Typography variant={"h2"} color='secondary' style={{marginTop: '5vh'}}>Send Money</Typography>
                <DashboardCard
                    className={classes.makePayment}
                    height={"auto"}
                    title={<Typography style={{color: "white"}} variant={"h6"}>Send Money</Typography>}
                    content={
                        <SendForm
                            status={true}
                            walletName={props.walletName}
                            walletPublicKey={props.walletPublicKey}
                            walletSeed={props.walletSeed}
                            snackbar={snackbarOpen}
                        />
                    }
                />
            </div>
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

export default Send;

