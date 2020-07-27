import React, {useEffect, useState} from 'react';
import QrCode from 'qrcode.react';
import {makeStyles, Typography} from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";

const useStyles = makeStyles (theme => ({
    grid: {
        [theme.breakpoints.up('xs')]: {
            paddingTop: theme.spacing(3),
        },
        [theme.breakpoints.up('sm')]: {
            // paddingTop: '20vh',
            paddingTop: theme.spacing(20)
        },
        overflowX: 'hidden',
        overflowY: 'hidden',
    },
    QRDiv: {
        width: 320,
        margin: 'auto',
    },
}));

const Receive = props => {
    const classes = useStyles();
    const [values, setValues] = useState({
        asset: '',
        amount: '',
        memoType: '',
        memo: '',
    });
    
    const handleChange = event => {
        const { name, value } = event.target;
        setValues({
            ...values,
            [name]: value
        });
    };
    
    return (
        <div className={classes.grid}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Card className={classes.QRDiv}>
                        <CardContent>
                            <FormControl className={classes.formControl} fullWidth style={{marginTop: 15}}>
                                <InputLabel htmlFor="sendingAnchor-helper">Asset Type</InputLabel>
                                <Select
                                    name={"asset"}
                                    value={values.asset}
                                    onChange={handleChange}
        
                                >
                                    <MenuItem value={"native"}>XLM</MenuItem>
                                    <MenuItem value={"GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG"}>AnchorUSD</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                style={{marginTop: 15}}
                                onChange={handleChange}
                                name={"amount"}
                                value={values.amount}
                                label="Amount"
                                placeholder="e.g. 100"
                                fullWidth={true}
                                autoComplete='off'
                            />
                            <FormControl className={classes.formControl} fullWidth style={{marginTop: 15}}>
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
                            </FormControl>
                            <TextField
                                style={{marginTop: 15}}
                                onChange={handleChange}
                                name={"memo"}
                                value={values.memo}
                                label="Memo"
                                placeholder="e.g. 100"
                                fullWidth={true}
                                autoComplete='off'
                            />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Card className={classes.QRDiv}>
                        <QrCode renderAs={'svg'} value={
                            `/receive/${props.walletPublicKey}/${values.asset}/${values.amount}/${values.memoType}/${values.memo}`
                        } size={320} />
                        <CardContent>
                            {props.walletPublicKey === '' ?
                                <Typography variant={"subtitle2"}>
                                    This QR Code is empty! Please Choose a Stellar Wallet before Scanning.
                                </Typography>
                                :
                                <Typography variant={"subtitle2"}>
                                    This QR Code represents the Stellar Public Key of {props.walletName}.
                                </Typography>
                            }
                        </CardContent>
                        {/*<CardActions>*/}
                        {/*    <Button id={'qrCode'} variant={'contained'} color={'primary'} value={*/}
                        {/*        `/receive/${props.walletPublicKey}/${values.asset}/${values.amount}/${values.memoType}/${values.memo}`*/}
                        {/*    }>Test QR Code</Button>*/}
                        {/*</CardActions>*/}
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
    // }
};

export default Receive;