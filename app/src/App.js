import React, { Fragment, useState, useEffect } from 'react';
import { Route, Switch } from "react-router-dom";
import {CssBaseline, makeStyles} from "@material-ui/core";
import SwipeableTemporaryDrawer from "./components/Drawer";
import Send from './pages/Send';
import TransactionHistory from "./pages/TransactionHistory";
import Assets from "./pages/Assets";
import Wallets from "./pages/Wallets";
import './styles/style.css'
import MenuItem from "@material-ui/core/MenuItem";
import SearchAppBar from "./components/SearchAppBar";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import CircularIndeterminate from "./components/CircularIndeterminate";
import { useAuth0 } from "./react-auth0-wrapper";
import Contacts from "./pages/Contacts";
import QRCode from "./pages/QRCode";
import Receive from "./pages/Receive";

const StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();

const useStyles = makeStyles(theme => ({
    menuItem: {
        color: 'black',
    },
    progress: {
        position: 'absolute',
        left: '49.2%',
        top: '44.7%',
    },
}));

const App = props => {
    const classes = useStyles();
    const [open, setOpen] = useState({drawer: false});
    const [walletSeed, setWalletSeed] = useState("Choose a Stellar Wallet");
    const [walletName, setWalletName] = useState("Choose a Stellar Wallet :)");
    const [walletPublicKey, setWalletPublicKey] = useState('');
    
    const {isAuthenticated, loading} = useAuth0();
    
    useEffect(() => {
        const setPublicKey = async () => {
            if (walletSeed !== 'Choose a Stellar Wallet') {
                setWalletPublicKey(StellarSdk.Keypair.fromSecret(walletSeed).publicKey());
            }
        };
        setPublicKey();
    }, [walletSeed]);
    
    const toggleOpen = (component, open) => event => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setOpen({ ...open, [component]: open });
    };
    
    const handleChange = () => event => {
        setWalletSeed(event.target.value);
        setWalletName(event.currentTarget.textContent);
    };
    
    // useEffect(() => {
    //     window.addEventListener("message", receiveMessage, false);
    // }, []);
    //
    // function receiveMessage (event) {
    //     if (event.origin !== "https://sandbox-portal.anchorusd.com") {
    //         return;
    //     }
    //     var data = JSON.parse(event.data);
    //     if (data.status === 'success' && data.type === 'withdraw') {
    //         let sourceKeys = StellarSdk.Keypair.fromSecret(props.walletSeed);
    //         let payload = {
    //             memo: {type: data.memo_type, value: data.memo},
    //             operations:[{
    //                 amount: data.amount,
    //                 asset: {
    //                     assetCode: 'USD',
    //                     type: 'alphanumeric4',
    //                     issuerAccount: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG"
    //                 },
    //                 type: 'payment'
    //             }],
    //             sourceAccount: props.walletPublicKey
    //         };
    //         submitSimbaApi(payload, sourceKeys).then(() => {
    //             // setAnchorUSDModal(false);
    //             console.log("Withdrawal Complete")
    //         })
    //     }
    // }
    
    function createMenuItems(localStorageWallets) {
        let arr = [];
        if (localStorageWallets !== null) {
            let parsedWallets = JSON.parse(localStorageWallets);
            arr.push(<MenuItem disabled key={0} value="Choose a Stellar Wallet">Choose a Stellar Wallet ...</MenuItem>);
            for (let i = 0; i < parsedWallets.length; i++) {
                arr.push(
                    <MenuItem value={parsedWallets[i].seed} key={i + 1}>
                        {parsedWallets[i].name}
                    </MenuItem>
                );
            }
        } else {
            arr.push(<MenuItem disabled key={0} value="Choose a Stellar Wallet">Add a Stellar Wallet ...</MenuItem>);
        }
        return arr;
    }
    
    if (loading) {
        return (
            <div className={classes.progress}>
                <CircularIndeterminate/>
            </div>
        );
    }
    return (
        !isAuthenticated ? (
            <Fragment>
                <Switch>
                    <Route path={'/'} component={Login}/>
                </Switch>
            </Fragment>
            ) : (
                <Fragment>
                <CssBaseline />
                <header>
                    <SearchAppBar
                        onClick={toggleOpen('drawer', true)}
                        menu={createMenuItems(localStorage.getItem('wallets'))}
                        onChange={handleChange()}
                        value={walletSeed}
                    />
                </header>
                <SwipeableTemporaryDrawer
                    open={open.drawer}
                    onClose={toggleOpen('drawer', false)}
                    onOpen={toggleOpen('drawer', true)}
                />
                <Switch>
                    <PrivateRoute path={"/"} exact component={Login}/>
                    <PrivateRoute path={"/send"} render={() =>
                        <Send
                            walletName={walletName}
                            walletPublicKey={walletPublicKey}
                            walletSeed={walletSeed}
                        />
                    }
                    />
                    <PrivateRoute path={"/receive"} render={() =>
                        <Receive
                            walletName={walletName}
                            walletPublicKey={walletPublicKey}
                            walletSeed={walletSeed}
                        />
                    }
                    />
                    <PrivateRoute path={"/qr_code"} render={() =>
                        <QRCode
                            walletName={walletName}
                            walletPublicKey={walletPublicKey}
                            walletSeed={walletSeed}
                        />
                    }
                    />
                    <PrivateRoute path={"/contacts"} render={() =>
                        <Contacts
                            walletName={walletName}
                            walletPublicKey={walletPublicKey}
                            walletSeed={walletSeed}
                        />
                    }
                    />
                    <PrivateRoute path={"/transaction_history"} render={() =>
                        <TransactionHistory
                            walletName={walletName}
                            walletPublicKey={walletPublicKey}
                            walletSeed={walletSeed}
                        />
                    }
                    />
                    <PrivateRoute path={"/assets"} render={() =>
                        <Assets
                            walletName={walletName}
                            walletPublicKey={walletPublicKey}
                            walletSeed={walletSeed}
                        />
                    }
                    />
                    <PrivateRoute path={"/wallets"} render={() =>
                        <Wallets
                            walletName={walletName}
                            walletPublicKey={walletPublicKey}
                            walletSeed={walletSeed}
                        />
                    }
                    />
                </Switch>
            </Fragment>
        )
    );
    
};

export default App;

