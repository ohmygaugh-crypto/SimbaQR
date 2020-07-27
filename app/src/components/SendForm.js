import React, {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from "@material-ui/core/FormHelperText";
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from "@material-ui/core/InputLabel";
import {TextField} from "@material-ui/core";
import {useAuth0} from "../react-auth0-wrapper";
import submitSimbaApi from '../models/SubmitSimbaApi';
import useForm from "../hooks/useForm";
import {fields, validate} from "../hooks/validateSend";

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

export default function SendForm(props) {
    const classes = useStyles();
    const steps = getSteps();
    const [activeStep, setActiveStep] = useState(0);
    const { getTokenSilently, user } = useAuth0();
    const { handleChange, handleSubmit, values, errors } = useForm(onSubmit, validate, fields);

    async function onSubmit() {
        try {
            let token = await getTokenSilently();
            await submitSimbaApi(values, props.walletSeed, props.walletPublicKey, token);
            setActiveStep(0);
            props.snackbar('success');
        } catch (error) {
            console.log(error);
            props.snackbar("error");
        }
    }
    
    const handleNext = () => {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
    };
    
    const handleBack = () => {
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    };
    
    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <div>
                        {/*<TextField*/}
                        {/*    error={!!errors.email}*/}
                        {/*    helperText={errors.email}*/}
                        {/*    onChange={handleChange}*/}
                        {/*    name={"email"}*/}
                        {/*    value={values.email}*/}
                        {/*    type={'email'}*/}
                        {/*    style={{margin: 8}}*/}
                        {/*    label="Email Address"*/}
                        {/*    placeholder="e.g. johnsmith@gmail.com"*/}
                        {/*    fullWidth={true}*/}
                        {/*/>*/}
                        <TextField
                            error={!!errors.destination}
                            helperText={errors.destination}
                            onChange={handleChange}
                            name={"destination"}
                            value={values.destination}
                            style={{margin: 8}}
                            label="Stellar Account ID"
                            placeholder="e.g. GAX2HLYIXCEZ34OIRCSXAD5BPNR52ES2S2PZRJZ22NHMNZZVOMOLA57L"
                            fullWidth={true}
                            autoComplete='off'
                        />
                    </div>
                );
            case 1:
                return (
                    <div>
                        <FormControl className={classes.formControl} fullWidth style={{margin: 8}}
                                     error={!!errors.asset}
                        >
                            <InputLabel htmlFor="sendingAnchor-helper">Asset Type</InputLabel>
                            <Select
                                name={"asset"}
                                value={values.asset}
                                onChange={handleChange}

                            >
                                <MenuItem value={"native"}>XLM</MenuItem>
                                <MenuItem value={"GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG"}>AnchorUSD</MenuItem>
                            </Select>
                            <FormHelperText>{errors.asset}</FormHelperText>
                        </FormControl>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <TextField
                            error={!!errors.amount}
                            helperText={errors.amount}
                            onChange={handleChange}
                            name={"amount"}
                            value={values.amount}
                            style={{margin: 8}}
                            label="Amount"
                            placeholder="e.g. 100"
                            fullWidth={true}
                            autoComplete='off'
                        />
                    </div>
                );
            case 3:
                return (
                    <div>
                        <FormControl className={classes.formControl} fullWidth style={{margin: 8}}
                                     error={!!errors.memoType}
                        >
                            <InputLabel htmlFor="sendingAnchor-helper">Memo Type</InputLabel>
                            <Select
                                name={"memoType"}
                                value={values.memoType}
                                onChange={handleChange}
                            >
                                <MenuItem value={"none"}>None</MenuItem>
                                <MenuItem value={"text"}>Text</MenuItem>
                                <MenuItem value={"id"}>ID</MenuItem>
                                <MenuItem value={"hash"}>Hash</MenuItem>
                                <MenuItem value={"return"}>Return</MenuItem>
                            </Select>
                            <FormHelperText>{errors.memoType}</FormHelperText>
                        </FormControl>
                        <TextField
                            error={!!errors.memo}
                            helperText={errors.memo}
                            onChange={handleChange}
                            name={"memo"}
                            value={values.memo}
                            style={{margin: 8}}
                            label="Memo"
                            placeholder="e.g. Sent from John Smith"
                            // placeholder={`e.g. Sent from ${user.name}`}
                            fullWidth={true}
                            autoComplete='off'
                        />
                    </div>
                );
            default:
                return ('Unknown step');
        }
    };
    
    return (
            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                        <StepContent>
                            {getStepContent(index)}
                                <div className={classes.actionsContainer}>
                                    <Button
                                        disabled={activeStep === 0}
                                        onClick={handleBack}
                                        className={classes.button}
                                    >
                                        Back
                                    </Button>
                                    {activeStep === steps.length - 1 ?
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleSubmit}
                                            className={classes.button}
                                        > {"Pay"} </Button> :
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleNext}
                                            className={classes.button}
                                        > {"Next"} </Button>
                                    }
                                </div>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
    );
}
