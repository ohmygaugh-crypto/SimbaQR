import React, { useState, useEffect } from 'react';
import {makeStyles, TextField, Grow} from "@material-ui/core";
import getPaymentHistory from "../models/PaymentHistory";
import {useAuth0} from "../react-auth0-wrapper";
var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();

const useStyles = makeStyles (theme => ({
    container: {
        overflow: "auto"
    }
}));

const RecentTransactionActionHistory = (props) => {
    
    const classes = useStyles();
    const { getTokenSilently } = useAuth0();
    const [transactionHistory, setTransactionHistory] = useState([]);
    
    useEffect(() => {
        const fetchData = async () => {
            const token = await getTokenSilently();
            if (props.walletPublicKey !== '') {
                setTransactionHistory([]);
                let result = await getPaymentHistory(props.walletPublicKey, '10', token);
                setTransactionHistory(result);
            }
        };
        fetchData();
    }, [props.walletPublicKey, props.refreshState]);
    
    const createTransactionHistory = (transaction) => {
        
        if (transaction.asset_type === "native") {
            if (transaction['from'] === props.walletPublicKey) {
                return (
                    <Grow in={true} key={transaction.transaction_hash}>
                        <TextField
                            id="standard-read-only-input"
                            key={transaction.transaction_hash}
                            label={transaction.created_at}
                            defaultValue={"Sent " + transaction.amount + " XLM to " + transaction.nameTo}
                            className={classes.textField}
                            margin="normal"
                            fullWidth={true}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Grow>
                );
            } else {
                return (
                    <Grow in={true} key={transaction.transaction_hash}>
                        <TextField
                            id="standard-read-only-input"
                            key={transaction.transaction_hash}
                            label={transaction.created_at}
                            defaultValue={"Received " + transaction.amount + " XLM from " + transaction.nameFrom}
                            className={classes.textField}
                            margin="normal"
                            fullWidth={true}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Grow>
                );
            }
        } else {
            if (transaction['from'] === props.walletPublicKey) {
                return (
                    <Grow in={true} key={transaction.transaction_hash}>
                        <TextField
                            id="standard-read-only-input"
                            key={transaction.transaction_hash}
                            label={transaction.created_at}
                            defaultValue={"Sent $" + transaction.amount + " to " + transaction.nameTo}
                            className={classes.textField}
                            margin="normal"
                            fullWidth={true}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Grow>
                );
            } else {
                return (
                    <Grow in={true} key={transaction.transaction_hash}>
                        <TextField
                            id="standard-read-only-input"
                            key={transaction.transaction_hash}
                            label={transaction.created_at}
                            defaultValue={"Received $" + transaction.amount + " from " + transaction.nameFrom}
                            className={classes.textField}
                            margin="normal"
                            fullWidth={true}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Grow>
                );
            }
        }
    };
    
    return (
        <div className={classes.container}>
            {transactionHistory.map((payment) => {
                return (
                    createTransactionHistory(payment)
                );
            })}
        </div>
    );
};

export default RecentTransactionActionHistory;