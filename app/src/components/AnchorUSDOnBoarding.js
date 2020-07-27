import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import Iframe from "react-iframe";

export default function AnchorUSDOnBoarding(props) {
    
    return (
        <div>
            <Dialog open={props.open} onClose={props.onClose} aria-labelledby="form-dialog-title" fullWidth={true} maxWidth={'xl'}>
                <Iframe
                    url={props.url}
                    width={"100%"}
                    height={"1250px"}
                    id={"anchorIframe"}
                    className={'myIframe'}
                    display={'initial'}
                    position={'relative'}
                    frameBorder={0}
                />
            </Dialog>
        </div>
        
    );
}
