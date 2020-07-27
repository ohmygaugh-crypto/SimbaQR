// src/index.js
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core';
import * as serviceWorker from "./serviceWorker";
import { Auth0Provider } from "./react-auth0-wrapper";
import {BrowserRouter} from "react-router-dom";

// A function that routes the user to the right place
// after login
const onRedirectCallback = appState => {
    window.history.replaceState(
        {},
        document.title,
        appState && appState.targetUrl
            ? appState.targetUrl
            : window.location.pathname
    );
};

const theme = createMuiTheme({
    "palette":{
        "common":{
            "black":"#000",
            "white":"#fff"
        },
        "background":{
            "paper":"#333333",
            "default":"#212121"
        },
        "primary":{
            "light":"rgba(100, 215, 255, 1)",
            "main":"rgba(9, 166, 224, 1)",
            "dark":"rgba(0, 119, 174, 1)",
            "contrastText":"#fff"
        },
        "secondary":{
            "light":"rgba(255, 255, 99, 1)",
            "main":"rgba(202, 209, 44, 1)",
            "dark":"rgba(149, 160, 0, 1)",
            "contrastText":"rgba(0, 0, 0, 1)"
        },
        "error":{
            "light":"#e57373",
            "main":"#f44336",
            "dark":"#d32f2f",
            "contrastText":"#fff"
        },
        "type": "dark"
    }
});

ReactDOM.render(
    <Auth0Provider
        domain={process.env.REACT_APP_DOMAIN}
        client_id={process.env.REACT_APP_CLIENTID}
        redirect_uri={window.location.origin}
        audience={process.env.REACT_APP_AUDIENCE}
        onRedirectCallback={onRedirectCallback}
    >
        <MuiThemeProvider theme={theme}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </MuiThemeProvider>
    </Auth0Provider>
    , document.getElementById("root")
);

serviceWorker.unregister();

if (module.hot) module.hot.accept();