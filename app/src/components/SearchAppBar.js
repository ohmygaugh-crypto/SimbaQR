import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { fade, makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import WalletIcon from '@material-ui/icons/AccountBalanceWallet';
import {InputAdornment} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
        width: '100%'
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    search: {
        color: 'white',
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        // backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.1),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
        marginRight: 0
    },
    walletIcon: {
        color: 'white'
    },
    textField: {
        color: 'white',
        minWidth: '100%',
        marginRight: 0
    },
    select: {
        color:'white'
    }
}));

export default function SearchAppBar(props) {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <AppBar position="static" color={"inherit"}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        className={classes.menuButton}
                        color="inherit"
                        aria-label="open drawer"
                        onClick={props.onClick}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography className={classes.title} variant="h6" noWrap>
                        SIMBA Pay
                    </Typography>
                    <div className={classes.search}>
                        <TextField
                            select
                            // className={clsx(classes.margin, classes.textField)}
                            className={classes.textField}
                            value={props.value}
                            onChange={props.onChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><WalletIcon className={classes.walletIcon}/></InputAdornment>,
                                className: classes.select
                            }}
                        >
                            {props.menu}
                        </TextField>
                    </div>
                </Toolbar>
            </AppBar>
        </div>
    );
}
