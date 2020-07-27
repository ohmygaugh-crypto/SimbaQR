import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useForm from "../hooks/useForm";
import {fields, validate} from "../hooks/validateContact";
import axios from "axios";
import {useAuth0} from "../react-auth0-wrapper";

export default function CreateContactDialog(props) {
    const { handleChange, handleSubmit, values, errors } = useForm(onSubmit, validate, fields);
    const { getTokenSilently } = useAuth0();
    async function onSubmit() {
        try {
            const token = await getTokenSilently();
            const result = await axios.post('/createContact', values, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            props.contacts.push(result.data);
            props.onClose('createContact')
        } catch (error) {
            console.log(error);
        }
    }
    
    return (
        <div>
            <Dialog open={props.open} onClose={props.onClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Create Contact</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        name="name"
                        label="Name"
                        fullWidth
                        value={values.name}
                        onChange={handleChange}
                        autoComplete='off'
                    />
                    <TextField
                        margin="dense"
                        id="extraInfo"
                        name="extraInfo"
                        label="Extra Information"
                        fullWidth
                        value={values.extraInfo}
                        onChange={handleChange}
                        autoComplete='off'
                    />
                    <TextField
                        margin="dense"
                        id="publicKey"
                        name="publicKey"
                        label="Public Key"
                        fullWidth
                        value={values.publicKey}
                        onChange={handleChange}
                        error={!!errors.publicKey}
                        helperText={errors.publicKey}
                        autoComplete='off'
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={props.onClose} color="primary">
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSubmit} value={false} color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
