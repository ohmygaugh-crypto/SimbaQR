import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';

var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();

const useStyles = makeStyles(theme => ({
    card: {
        width: '100%',
        textAlign: 'left',
    },
    noWallet: {
        width: '100%',
        textAlign: 'center',
    },
}));

export default function WalletInfo(props) {
    const classes = useStyles();
    
    if (localStorage.getItem("wallets")===null) {
        
        return (
            <div className={classes.noWallet}>
                <Typography>
                    You do not currently have a wallet. Navigate to "Wallets",
                </Typography>
                <Typography>
                    and click the floating action button to add one :)
                </Typography>
            </div>
        );
    
    } else if (props.seedWallet === 'Choose a Stellar Wallet') {
        return (
            <div className={classes.noWallet}>
                <Typography variant={'h6'}>
                    Please Choose a Stellar Wallet :)
                </Typography>
            </div>
        )
    } else {
        
        return (
            <div className={classes.card}>
                <Typography variant={"h6"}>{props.walletName}</Typography>
                <Typography variant={'subtitle2'}>{props.walletPublicKey}</Typography>
            </div>
        )
    }
}