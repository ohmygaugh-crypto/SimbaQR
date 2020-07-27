import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import useForm from "../hooks/useForm";
import { fields, validate } from "../hooks/validateSend";
import { makeStyles } from "@material-ui/core";
import submitSimbaApi from "../models/SubmitSimbaApi";
import {useAuth0} from "../react-auth0-wrapper"

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
    }
}));

export default function SendMoneyDialog(props) {
    const classes = useStyles();
    const { handleChange, handleSubmit, values, errors, setValues } = useForm(onSubmit, validate, fields);
    const { getTokenSilently } = useAuth0();
    
    useEffect(() => {
        const setPublicKey = async () => {
            setValues(oldValues => ({
                ...oldValues, 'destination': props.destination
            }));
        };
        setPublicKey();
    }, [props.destination]);
    
    async function onSubmit() {
        let token = await getTokenSilently();
        await submitSimbaApi(values, props.walletSeed, props.walletPublicKey, token);
        setValues({
            amount: '',
            asset: '',
            destination: '',
            memo: '',
            memoType: '',
        })
        props.onClose();
    }
    
    return (
        <div>
            <Dialog open={props.open} onClose={props.onClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Send Money</DialogTitle>
                <DialogContent>
                    <FormControl className={classes.formControl} fullWidth
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
                    <TextField
                        margin="normal"
                        id="amount"
                        name="amount"
                        label="Amount"
                        error={!!errors.amount}
                        helperText={errors.amount}
                        fullWidth
                        value={values.amount}
                        onChange={handleChange}
                    />
                    <FormControl className={classes.formControl} fullWidth
                                 error={!!errors.memoType} style={{marginTop: 20}}
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
                        margin="normal"
                        id="memo"
                        name="memo"
                        label="Memo"
                        error={!!errors.memo}
                        helperText={errors.memo}
                        fullWidth
                        value={values.memo}
                        onChange={handleChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={props.cancel} color="primary">
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSubmit} color="primary">
                        Send
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
