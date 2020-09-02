import React from 'react';
import Create from './Create';
import Explore from './Explore';
import SignUp from './SignUp';
import Login from './Login';
import Verify from './Verify';
import { BrowserRouter, Route } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './theme';
import { hot } from 'react-hot-loader';
import './css/style.css';

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <Route path="/" component={Explore} exact />
                <Route path="/explore" component={Explore} exact />
                <Route path="/create" component={Create} exact />
                <Route path="/signup" component={SignUp} exact />
                <Route path="/login" component={Login} exact />
                <Route path="/verify" component={Verify} exact />
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default hot(module)(App);


