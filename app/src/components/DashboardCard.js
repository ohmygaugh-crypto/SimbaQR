import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Card, CardContent} from "@material-ui/core";

const useStyles = makeStyles (theme => ({
    card: {
        marginTop: theme.spacing(2),
        marginLeft: theme.spacing(0.4),
        marginRight: theme.spacing(0.4),
        marginBottom: theme.spacing(1)
    },
    cardHeader: {
        backgroundColor: "#3f51b5",
    }
}));

const DashboardCard = (props) => {
    
    const classes = useStyles();
    
    return (
        <Card className={classes.card} style={{height: props.height}}>
            <CardContent>
                {props.content}
            </CardContent>
            {props.actions}
        </Card>
    );
};

export default DashboardCard;