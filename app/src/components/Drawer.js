import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Divider, List, ListItem, ListItemIcon, ListItemText, SwipeableDrawer } from '@material-ui/core';
import { AccountBalanceWallet, ExitToApp, History, Security, Send, Contacts, Payment } from '@material-ui/icons'
import { Link } from "react-router-dom";
import { useAuth0 } from "../react-auth0-wrapper";
import Qrcode from "mdi-material-ui/Qrcode";

const useStyles = makeStyles(theme => ({
    drawer: {
    
    },
    list: {
        width: 250,
    },
    fullList: {
        width: 'auto',
    },
}));

export default function SwipeableTemporaryDrawer(props) {
    const classes = useStyles();
    const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
    const sideList = () => (
        <div
            className={classes.list}
            role="presentation"
            onClick={props.onClose}
            onKeyDown={props.onClose}
        >
            <List component={List}>
                <ListItem button component={Link} to={"/send"}>
                    <ListItemIcon><Send/></ListItemIcon>
                    <ListItemText primary={"Send"}/>
                </ListItem>
                <ListItem button component={Link} to={"/receive"}>
                    <ListItemIcon><Payment/></ListItemIcon>
                    <ListItemText primary={"Receive"}/>
                </ListItem>
                <ListItem button component={Link} to={"/transaction_history"}>
                    <ListItemIcon><History/></ListItemIcon>
                    <ListItemText primary={"Transaction History"}/>
                </ListItem>
                <ListItem button component={Link} to={"/contacts"}>
                    <ListItemIcon><Contacts/></ListItemIcon>
                    <ListItemText primary={"Contacts"}/>
                </ListItem>
                <ListItem button component={Link} to={"/assets"}>
                    <ListItemIcon><Security/></ListItemIcon>
                    <ListItemText primary={"Assets"}/>
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem button component={Link} to={"/qr_code"}>
                    <ListItemIcon><Qrcode/></ListItemIcon>
                    <ListItemText primary={"Wallet QR Codes"}/>
                </ListItem>
                <ListItem button component={Link} to={"/wallets"}>
                    <ListItemIcon><AccountBalanceWallet/></ListItemIcon>
                    <ListItemText primary={"Wallets"}/>
                </ListItem>
            </List>
            <Divider />
            <List>
                {!isAuthenticated && (
                    <ListItem button onClick={() => loginWithRedirect({})}>
                        <ListItemIcon><ExitToApp/></ListItemIcon>
                        <ListItemText primary={"Login"}/>
                    </ListItem>
                )}
                {isAuthenticated &&
                <ListItem button onClick={() => logout()}>
                    <ListItemIcon><ExitToApp/></ListItemIcon>
                    <ListItemText primary={"Logout"}/>
                </ListItem>}
            </List>
        </div>
    );
    
    return (
        <div>
            <SwipeableDrawer
                open={props.open}
                onClose={props.onClose}
                onOpen={props.onOpen}
                className={classes.drawer}
                color={'secondary'}
            >
                {sideList()}
            </SwipeableDrawer>
        </div>
    );
}
