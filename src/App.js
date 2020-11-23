import { hot } from 'react-hot-loader';
import React from 'react';
import Explore from './Explore';
import SignUp from './SignUp';
import Verify from './Verify';
import Dashboard from './Components/Dashboard'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './theme';
import './css/style.css';
import Blog from './Blog';
import Bugs from './Bugs';
import Upload from './Upload';
import NotFound from './NotFound';
import LoginPage from './LoginPage';
import GetResetCode from './ResetPw/GetResetCode.js';
import EnterNewPassword from './ResetPw/EnterNewPassword';


function App() {
    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <Switch>
                    <Route path="/" component={Explore} exact />
                    <Route path="/explore" component={Explore} exact />
                    <Route path="/signup" component={SignUp} exact />
                    <Route path="/login" component={LoginPage} exact />
                    <Route path="/verify" component={Verify} exact />
                    <Route path="/dashboard" component={Dashboard} exact />
                    <Route path="/upload" component={Upload} exact />
                    <Route path="/blog" component={Blog} exact />
                    <Route path="/bugs" component={Bugs} exact />
                    <Route path="/resetpw" component={GetResetCode} exact />
                    <Route path="/resetpw/new" component={EnterNewPassword} exact />
                    <Route path="/404" component={NotFound} />
                    <Redirect to='/404' />
                </Switch>
            </ThemeProvider>
        </BrowserRouter>
    );
}


export default hot(module)(App);


