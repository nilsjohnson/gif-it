import { hot } from 'react-hot-loader';
import React from 'react';
import Explore from './Explore';
import SignUp from './SignUp';
import Login from './Login';
import Verify from './Verify';
import Dashboard from './Dashboard'
import { BrowserRouter, Route } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './theme';
import './css/style.css';
import Hot from './Components/Hot';



function App() {
    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
            <Route path="/hot" component={Hot} exact /> 
                <Route path="/" component={Explore} exact />
                <Route path="/explore" component={Explore} exact />
                <Route path="/signup" component={SignUp} exact />
                <Route path="/login" component={Login} exact />
                <Route path="/verify" component={Verify} exact />
                <Route path="/dashboard" component={Dashboard} exact /> 
                
            </ThemeProvider>
        </BrowserRouter>
    );
}


export default hot(module)(App);


