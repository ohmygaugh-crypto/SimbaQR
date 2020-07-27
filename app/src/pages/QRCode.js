import React from 'react';
import QrCode from 'qrcode.react';
import {makeStyles, Typography} from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

const useStyles = makeStyles (theme => ({
    QRDiv: {

        width: 320,
        height: 320,
        margin: 'auto',
        marginTop: '30vh',
    },
    cards: {
        // paddingLeft: theme.spacing(50),
        // paddingRight: theme.spacing(10),
        // paddingTop: theme.spacing(10),
        // paddingBottom: theme.spacing(10),
        // width: theme.spacing(90),
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: theme.spacing(5),
        overflowX: 'hidden',
    },
}));

const QRCode = props => {
    const classes = useStyles();
    // if (props.walletPublicKey === '') {
    //     return (
    //         <Typography>Choose a Wallet</Typography>
    //     );
    // } else {
        return (
            <div className={classes.QRDiv}>
                <Card>
                    <QrCode renderAs={'svg'} value={props.walletPublicKey} size={320}/>
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
                </Card>
                {/*<Icon path={mdiQrcode} color={'white'}/>*/}
            </div>
        );
    // }
};

export default QRCode;