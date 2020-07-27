import React from "react";
import { Redirect } from "react-router-dom";
import { useAuth0 } from "../react-auth0-wrapper";
import { makeStyles } from "@material-ui/core";
import CircularIndeterminate from "../components/CircularIndeterminate";

const useStyles = makeStyles(theme => ({
    menuItem: {
        color: 'black',
    },
    progress: {
        position: 'absolute',
        left: '49.2%',
        top: '44.7%',
    },
}));

const Login = () => {
    const classes = useStyles();
    const {isAuthenticated, loginWithRedirect, loading} = useAuth0();
    
    if (loading) {
        return (
            <div className={classes.progress}>
                <CircularIndeterminate/>
            </div>
        );
    }
    
    if (isAuthenticated) {
        return <Redirect to={'/send'}/>
    }
    
    return (loginWithRedirect({}));
};

export default Login;