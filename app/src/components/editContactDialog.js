import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function EditContactDialog(props) {
    
    return (
        <div>
            <Dialog open={props.open} onClose={props.onClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Edit Contact</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        name="name"
                        label="Name"
                        fullWidth
                        value={props.name}
                        onChange={props.onChange}
                        autoComplete='off'
                    />
                    <TextField
                        margin="dense"
                        id="extraInfo"
                        name="extraInfo"
                        label="Extra Information"
                        fullWidth
                        value={props.extraInfo}
                        onChange={props.onChange}
                        autoComplete='off'
                    />
                    <TextField
                        margin="dense"
                        id="publicKey"
                        name="publicKey"
                        label="Public Key"
                        fullWidth
                        value={props.publicKey}
                        onChange={props.onChange}
                        error={!!props.error}
                        helperText={props.error}
                        autoComplete='off'
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={props.onClose} color="primary">
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={props.onClick} value={true} color="primary">
                        Edit
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
