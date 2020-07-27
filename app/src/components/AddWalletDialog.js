import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import RadioButtons from "./RadioButton";

export default function AddWalletDialog(props) {
    const [value, setValue] = React.useState('Create');
    
    function handleChange(event) {
        setValue(event.target.value);
    }
    
    return (
        <div>
            <Dialog open={props.open} onClose={props.onClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Add/Create Wallet</DialogTitle>
                <DialogContent>
                    <RadioButtons
                        value={value}
                        onChange={handleChange}
                    />
                    <DialogContentText>
                        Please make sure you keep a note of your seed, since it will be stored in cache. It will not be possible to recover your seed if it
                        is lost.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="walletName"
                        label="Wallet Name"
                        rowsMax='2'
                        fullWidth
                        value={props.walletName}
                        onChange={props.walletChange}
                        autoComplete='off'
                    />
                    {value === "Add" ? <TextField
                        required
                        margin="dense"
                        id="seed"
                        label="Seed (Secret)"
                        rowsMax='2'
                        fullWidth
                        value={props.seed}
                        onChange={props.seedChange}
                        autoComplete='off'
                    /> : null
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={props.cancel} color="primary">
                        Cancel
                    </Button>
                    {value === "Add" ? <Button variant="contained" onClick={props.add} color="primary">
                        Add
                    </Button> : <Button variant="contained" onClick={props.create} color="primary">
                        Create
                    </Button>
                    }
                </DialogActions>
            </Dialog>
        </div>
    );
}
