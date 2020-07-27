import React, {useState, useEffect, Fragment} from 'react';
import {Typography, Grid, makeStyles} from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AddIcon from '@material-ui/icons/Add';
import Fab from "@material-ui/core/Fab";
import clsx from 'clsx';
import axios from "axios";
import AddWalletDialog from "../components/AddWalletDialog";
import CircularIndeterminate from "../components/CircularIndeterminate";
import {useAuth0} from "../react-auth0-wrapper";

var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();

const useStyles = makeStyles (theme => ({
    grid: {
        padding: theme.spacing(3),
        overflowX: 'hidden',
        // position: 'relative'
    },
    card: {
        position: 'relative'
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
        position: 'absolute',
        right: '0.5%',
        top: '50%'
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    fab: {
        position: 'fixed',
        bottom: theme.spacing(4),
        right: theme.spacing(4),
    },
    progress: {
        position: 'absolute',
        left: '49.2%',
        top: '44.7%',
    },
}));

const Wallets = () => {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState({});
    const [cardContent, setCardContent] = useState([]);
    const [walletModal, setWalletModal] = useState(false);
    const [seed, setSeed] = useState('');
    const [newWalletName, setNewWalletName] = useState('');
    const { getTokenSilently } = useAuth0();
    
    const handleExpandClick = (cardKey) => event => {
        setExpanded(oldValues => ({
            ...oldValues,
            [cardKey]: !expanded[cardKey],
        }));
    };
    
    useEffect(() => {
        const fetchData = async () => {
            if (localStorage.getItem('wallets') !== null) {
                setLoading(true);
                const result = await walletInfo();
                let jsonCard = {};
                result.forEach((wallet) => {
                    let cardKey = wallet.publicKey;
                    jsonCard[cardKey] = false;
                });
                setExpanded(jsonCard);
                setCardContent(result);
                setLoading(false);
            }
        };
        fetchData();
    }, [localStorage.getItem('wallets')]);
    
    if (loading) {
        return (
            <div className={classes.progress}>
                <CircularIndeterminate/>
            </div>
        );
    }
    
    async function walletInfo() {
        if (localStorage.getItem('wallets') !== null) {
            try {
                var accountArray = [];
                const wallets = localStorage.getItem('wallets');
                const parsedWallets = JSON.parse(wallets);
                for (var i = 0; i < parsedWallets.length; i++) {
                    let theWalletName = parsedWallets[i].name;
                    let theSeed = parsedWallets[i].seed;
                    const sourceKeys = StellarSdk.Keypair.fromSecret(theSeed);
                    let thePublicKey = sourceKeys.publicKey().toString();
                    // const account = await horizon.loadAccount(sourceKeys.publicKey());
                    let accountInformation = {
                        walletName: theWalletName,
                        publicKey: thePublicKey,
                        seed: theSeed,
                        // balances: account.balances
                    };
                    accountArray.push(accountInformation);
                }
                return accountArray;
            } catch (error) {
                console.log(error.response);
                return "Error in get Wallet Information"
            }
        }
    }
    
    const createWalletCards = (props) => {
        return (
            <Grid item xs={12} key={props.publicKey}>
                <Card className={classes.card}>
                    <CardContent>
                        <Typography variant="h5" color="textPrimary" component="p">
                            {props.walletName}
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary" component="p">
                            {props.publicKey}
                        </Typography>
                    </CardContent>
                    <CardActions disableSpacing>
                        <IconButton
                            className={clsx(classes.expand, {
                                [classes.expandOpen]: expanded[props.publicKey],
                            })}
                            onClick={handleExpandClick(props.publicKey)}
                            aria-expanded={expanded}
                            aria-label="show more"
                        >
                            <ExpandMoreIcon/>
                        </IconButton>
                    </CardActions>
                    <Collapse in={expanded[props.publicKey]} timeout="auto" unmountOnExit>
                        <CardContent>
                            <Typography>
                                Seed: {props.seed}
                            </Typography>
                        </CardContent>
                    </Collapse>
                </Card>
            </Grid>
            
        );
    };
    
    const handleSeedChange = event => {
        setSeed(event.target.value);
    };
    
    const handleWalletChange = event => {
        setNewWalletName(event.target.value);
    };
    
    const createWallet = () => {
        var pair = StellarSdk.Keypair.random();
        axios.post(`https://friendbot.stellar.org?addr=${encodeURIComponent(pair.publicKey())}`).then(() => {
            console.log(pair.secret());
            let secretKey = pair.secret();
            if (localStorage.getItem('wallets')===null) {
                let arr = [];
                let newWallets = {};
                newWallets['name'] = newWalletName;
                newWallets['seed'] = secretKey;
                arr.push(newWallets);
                localStorage.setItem('wallets', JSON.stringify(arr));
            } else {
                let updateWallets = localStorage.getItem('wallets');
                let updateWalletsObj = JSON.parse(updateWallets);
                let newWallet = {};
                newWallet['name'] = newWalletName;
                newWallet['seed'] = secretKey;
                updateWalletsObj.push(newWallet);
                localStorage.setItem('wallets', JSON.stringify(updateWalletsObj));
            }
            let publicKey = pair.publicKey().toString();
            getTokenSilently().then((token) => {
                axios.post('/addWallet', {publicKey: publicKey}, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }).then(() => {
                    setWalletModal(false);
                    setNewWalletName('');
                });
            });
        });
    };
    
    const addWallet = (seed) => event =>  {
        if (localStorage.getItem('wallets')===null) {
            let arr = [];
            let newWallets = {};
            newWallets['name'] = newWalletName;
            newWallets['seed'] = seed;
            arr.push(newWallets);
            localStorage.setItem('wallets', JSON.stringify(arr));
        } else {
            let updateWallets = localStorage.getItem('wallets');
            let updateWalletsObj = JSON.parse(updateWallets);
            let newWallet = {};
            newWallet['name'] = newWalletName;
            newWallet['seed'] = seed;
            updateWalletsObj.push(newWallet);
            localStorage.setItem('wallets', JSON.stringify(updateWalletsObj));
        }
        let publicKey = StellarSdk.Keypair.fromSecret(seed).publicKey().toString();
        getTokenSilently().then((token) => {
            axios.post('/addWallet', {publicKey: publicKey}, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            }).then(() => {
                setWalletModal(false);
                setNewWalletName('');
            });
        });
    };
    
    const handleChange = (open) => event => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setWalletModal(open);
    };
    
    return (
        <Fragment>
        <div className={classes.grid}>
            <Grid container spacing={3}>
                {cardContent.map(account => {
                    return createWalletCards(account);
                })}
            </Grid>
            <Fab onClick={handleChange(true)} color="secondary" aria-label="add" className={classes.fab}>
                <AddIcon />
            </Fab>
        </div>
        <AddWalletDialog
            open={walletModal}
            cancel={handleChange(false)}
            onClose={handleChange(false)}
            add={addWallet(seed)}
            create={createWallet}
            seed={seed}
            seedChange={handleSeedChange}
            walletName={newWalletName}
            walletChange={handleWalletChange}
        />
        </Fragment>
    );
};

export default Wallets;

