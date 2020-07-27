import React, {useEffect, useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import Input from '@material-ui/core/Input'
import InputLabel from "@material-ui/core/InputLabel";
import axios from 'axios';
import {TextField, Typography} from "@material-ui/core";
import {useAuth0} from "../react-auth0-wrapper";
import Box from "@material-ui/core/Box";
import submitSimbaApi from '../models/SubmitSimbaApi';

var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
    },
    button: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    actionsContainer: {
        marginBottom: theme.spacing(2),
    }
}));

function getSteps() {
    return ['Who are you paying?', 'Choose the asset', 'How much?', 'Add a Memo'];
}

export default function VerticalLinearStepper(props) {
    const classes = useStyles();
    const steps = getSteps();
    const [activeStep, setActiveStep] = useState(0);
    const [profile, setProfile] = useState('');
    const [asset, setAsset] = useState('');
    // const [amount, setAmount] = useState('');
    const [memo, setMemo] = useState('');
    const [memoType, setMemoType] = useState('');
    const [email, setEmail] = useState('');
    const [newPublicKey, setNewPublicKey] = useState('');
    const [users, setUsers] = useState([]);
    const { getTokenSilently, user } = useAuth0();
    
    function handleProfile(event) {
        setProfile(event.target.value);
    }
    function handleAssetChange(event) {
        setAsset(event.target.value);
    }
    // function handleAmountChange(event) {
    //     setAmount(event.target.value);
    // }
    function handleMemoChange(event) {
        setMemo(event.target.value);
    }
    function handleMemoTypeChange(event) {
        setMemoType(event.target.value);
    }
    function handleEmailChange(event) {
        setEmail(event.target.value);
    }
    function handleNewPublicKeyChange(event) {
        setNewPublicKey(event.target.value);
    }
    function handleNext() {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
    }
    function handleBack() {
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    }
    const handleSubmit = (someoneNew) => event => {
        try {
            let sourceKeys = StellarSdk.Keypair.fromSecret(props.walletSeed);
            let payload = {
                operations:[{
                    amount: props.amount,
                    type: 'payment'
                }],
                sourceAccount: props.walletPublicKey
            };
            if (memoType !== 'none') {
                payload['memo'] = {type: memoType, value: memo};
            }
            if (asset !== 'native') {
                payload.operations[0].asset = {assetCode: 'USD', type: 'alphanumeric4', issuerAccount: asset};
            } else {
                payload.operations[0].asset = {type: asset};
            }
            if (!someoneNew) {
                payload.operations[0].destination = profile;
            } else {
                payload.operations[0].destination = newPublicKey;
            }
            submitSimbaApi(payload, sourceKeys).then(() => {
                getTokenSilently().then((token) => {
                    let payeeBody = {};
                    if (!someoneNew) {
                        payeeBody = {publicKey: profile};
                    } else {
                        payeeBody = {publicKey: newPublicKey};
                    }
                    axios.post('/addPayee', payeeBody, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    }).then(() => {
                        let emailBody = {};
                        if (!someoneNew) {
                            if (asset === "native") {
                                emailBody = {
                                    publicKey: profile,
                                    text: "You have been sent " + props.amount + " XLM from " +
                                        user.name
                                };
                            } else {
                                emailBody = {
                                    publicKey: profile,
                                    text: "You have been sent " + props.amount + " " + asset + " from " +
                                        user.name
                                };
                            }
                        } else {
                            if (asset === "native") {
                                emailBody = {
                                    publicKey: newPublicKey,
                                    text: "You have been sent " + props.amount + " XLM from " +
                                        user.name
                                };
                            } else {
                                emailBody = {
                                    publicKey: newPublicKey,
                                    text: "You have been sent " + props.amount + " " + asset + " from " +
                                        user.name
                                };
                            }
                        }
                        axios.post('/sendEmail', emailBody, {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            }
                        }).then(() => {
                            setActiveStep(0);
                            setProfile('');
                            setEmail('');
                            setNewPublicKey('');
                            setAsset('');
                            props.resetAmount();
                            setMemo('');
                            setMemoType('');
                            props.handleRefresh();
                            props.snackbar('success');
                            event.persist();
                        }).catch((error) => {
                            props.snackbar("error");
                        });
                    }).catch((error) => {
                        props.snackbar("error");
                    });
                }).catch((error) => {
                    props.snackbar("error");
                });
            }).catch((error) => {
                props.snackbar("error");
            });
        } catch (error) {
            props.snackbar("error");
        }
    };

    
    useEffect(() => {
        const fetchData = async () => {
            if (props.walletPublicKey !== '') {
                try {
                    const token = await getTokenSilently();
                    const result = await axios.post('/getPayees', {publicKey: props.walletPublicKey}
                    ,{
                        headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                        }
                    });
                    // console.log(result.data);
                    setUsers(result);
                } catch (error) {
                    console.log(error);
                }
            }
        };
        fetchData();
    }, [props.walletPublicKey]);
    
    function createMenuItems(users) {
        // console.log(users);
        if (users.data === undefined) {
            return (<MenuItem disabled value={''}>Please Select a Stellar Wallet.</MenuItem>)
        } else {
            let arr = [];
            for (let i = 0; i < users.data.length; i++) {
                if (users.data[i].Wallet.publicKey === props.walletPublicKey) {
                    if (users.data.length === 1) {
                        arr.push(<MenuItem disabled value={''}>You currently have that wallet selected</MenuItem>)
                    }
                    continue
                }
                arr.push(
                    <MenuItem value={users.data[i].Wallet.publicKey} key={users.data[i].Wallet.publicKey}>
                        <Box display={'block'}>
                            <Typography variant={"body1"}>{users.data[i].Wallet.Users[0].email}</Typography>
                            <Typography variant={'caption'}>{users.data[i].Wallet.publicKey}</Typography>
                        </Box>
                    </MenuItem>
                );
            }
            return arr;
        }
    }
    function someoneNew(status) {
        if (!status) {
            return (
                <FormControl fullWidth={true} className={classes.formControl} style={{margin: 8}}>
                    <InputLabel htmlFor="payee-helper">Payee</InputLabel>
                    <Select
                        value={profile}
                        onChange={handleProfile}
                        input={<Input name="payee" id="payee-helper" />}
                    >
                        {createMenuItems(users)}
                    </Select>
                </FormControl>
            );
        } else {
            return (
                <div>
                    <TextField
                        value={email}
                        onChange={handleEmailChange}
                        style={{margin: 8}}
                        label="Email Address"
                        placeholder="e.g. johnsmith@gmail.com"
                        fullWidth={true}
                        type={'email'}
                    />
                    <TextField
                        value={newPublicKey}
                        onChange={handleNewPublicKeyChange}
                        style={{margin: 8}}
                        label="Stellar Account ID"
                        placeholder="e.g. GAX2HLYIXCEZ34OIRCSXAD5BPNR52ES2S2PZRJZ22NHMNZZVOMOLA57L"
                        fullWidth={true}
                    />
                </div>
            );
        }
    }
    
    function getStepContent(step) {
        switch (step) {
            case 0:
                return (
                    <div>
                        {someoneNew(props.status)}
                        <div className={classes.actionsContainer}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                className={classes.button}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleNext}
                                className={classes.button}
                            >
                                {activeStep === steps.length - 1 ? 'Pay' : 'Next'}
                            </Button>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div>
                        <FormControl className={classes.formControl} fullWidth style={{margin: 8}}>
                            <InputLabel htmlFor="sendingAnchor-helper">Asset Type</InputLabel>
                            <Select
                                value={asset}
                                onChange={handleAssetChange}
                            >
                                <MenuItem value={"native"}>XLM</MenuItem>
                                <MenuItem value={"GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG"}>AnchorUSD</MenuItem>
                            </Select>
                        </FormControl>
                        <div className={classes.actionsContainer}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                className={classes.button}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleNext}
                                className={classes.button}
                            >
                                {activeStep === steps.length - 1 ? 'Pay' : 'Next'}
                            </Button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <TextField
                            value={props.amount}
                            onChange={props.setAmount}
                            style={{margin: 8}}
                            label="Amount"
                            placeholder="e.g. 100"
                            fullWidth={true}
                            
                        />
                        <div className={classes.actionsContainer}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                className={classes.button}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleNext}
                                className={classes.button}
                            >
                                {activeStep === steps.length - 1 ? 'Pay' : 'Next'}
                            </Button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <FormControl className={classes.formControl} fullWidth style={{margin: 8}}>
                            <InputLabel htmlFor="sendingAnchor-helper">Memo Type</InputLabel>
                            <Select
                                value={memoType}
                                onChange={handleMemoTypeChange}
                            >
                                <MenuItem value={"none"}>None</MenuItem>
                                <MenuItem value={"text"}>Text</MenuItem>
                                <MenuItem value={"id"}>ID</MenuItem>
                                <MenuItem value={"hash"}>Hash</MenuItem>
                                <MenuItem value={"return"}>Return</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            value={memo}
                            onChange={handleMemoChange}
                            style={{margin: 8}}
                            label="Memo"
                            placeholder="e.g. 100"
                            fullWidth={true}
    
                        />
                        <div className={classes.actionsContainer}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                className={classes.button}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit(props.status)}
                                className={classes.button}
                            >
                                {activeStep === steps.length - 1 ? 'Pay' : 'Next'}
                            </Button>
                        </div>
                    </div>
                );
            default:
                return ('Unknown step');
        }
    }
    return (
            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                        <StepContent>
                            {getStepContent(index)}
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
    );
}
