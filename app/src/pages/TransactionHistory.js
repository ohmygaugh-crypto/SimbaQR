import React, { useEffect, useState } from 'react';
import {Grid, makeStyles, Typography, Box} from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import getPaymentHistory from "../models/PaymentHistory";
import CardHeader from "@material-ui/core/CardHeader";
import CheckCircleIcon from '@material-ui/icons/CheckCircleOutline'
import ErrorIcon from '@material-ui/icons/ErrorOutline';
import CircularIndeterminate from "../components/CircularIndeterminate";
import { useAuth0 } from "../react-auth0-wrapper";
var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();

const useStyles = makeStyles (theme => ({
    grid: {
        padding: theme.spacing(3),
        overflowX: 'hidden',
    },
    card: {
        position: 'relative'
    },
    icon: {
        position: 'absolute',
        right: '1%',
        top: '5%',
        width: 45,
        height: 45,
    },
    progress: {
        position: 'absolute',
        left: '49.2%',
        top: '44.7%',
    },
    fab: {
        position: 'fixed',
        bottom: theme.spacing(4),
        right: theme.spacing(4),
    },
}));

const TransactionHistory = props => {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [cardContent, setCardContent] = useState([]);
    const { getTokenSilently } = useAuth0();
    
    useEffect(() => {
        const fetchData = async () => {
            const token = await getTokenSilently();
            if (props.walletPublicKey !== '') {
                setLoading(true);
                const result = await getPaymentHistory(props.walletPublicKey, '200',  token);
                setCardContent(result);
                setLoading(false);
            }
        };
        fetchData();
    }, [props.walletPublicKey]);
    
    const sendReceive = (sourceAccount) => {
        if (sourceAccount === props.walletPublicKey) {
            return ["Sent", "To"];
        } else {
            return ["Received", "From"];
        }
    };
    
    const createTransactionHistory = (transaction) => {
        return (
            <Grid item xs={12} key={transaction.transaction_hash}>
                <Card className={classes.card}>
                    <CardHeader
                        title={
                            <Box component={'div'} display={'inline'}>
                                {transaction.successful ?
                                    <Typography
                                        style={{color: 'green'}}
                                        display={'inline'}
                                        variant={'h4'}>
                                        {sendReceive(transaction['from'])[0]}
                                    </Typography> :
                                    <Typography
                                        style={{color: 'red'}}
                                        display={'inline'}
                                        variant={'h4'}>
                                        {'Transaction Failed'}
                                    </Typography>
                                }
                                {transaction.successful ?
                                    <CheckCircleIcon style={{color: 'green'}} className={classes.icon}/> :
                                    <ErrorIcon style={{color: 'red'}} className={classes.icon}/>
                                }
                            </Box>
                        }
                        subheader={
                            <Typography color="textSecondary" variant={'subtitle2'}>
                                {transaction.transaction_hash}
                            </Typography>
                        }
                    />
                    <CardContent>
                        <Typography variant="h5" color="textPrimary" component="p">
                            {transaction.asset_type === "native" ?
                                transaction.amount + " XLM" :
                                "$" + parseFloat(transaction.amount).toFixed(2)}
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary" component="p">
                            {sendReceive(transaction['from'])[1] === "From" ?
                                'From ' + transaction.nameFrom :
                                'To ' + transaction.nameTo
                            }
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        );
    };
    if (loading) {
        return (
            <div className={classes.progress}>
                <CircularIndeterminate/>
            </div>
        );
    }
    return (
        <div className={classes.grid}>
            <Grid container spacing={3}>
                {cardContent.map(transaction => {
                    return createTransactionHistory(transaction);
                })}
            </Grid>
        </div>

    );
};

export default TransactionHistory;