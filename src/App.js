import { hot } from 'react-hot-loader';
import React from 'react';
import Explore from './Explore';
import SignUp from './SignUp';
import Login from './Login';
import Verify from './Verify';
import Dashboard from './Components/Dashboard'
import { BrowserRouter, Route } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './theme';
import './css/style.css';
import Blog from './Blog';
import Bugs from './Bugs';
import Upload from './Upload';

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <Route path="/" component={Explore} exact />
                <Route path="/explore" component={Explore} exact />
                <Route path="/signup" component={SignUp} exact />
                <Route path="/login" component={Login} exact />
                <Route path="/verify" component={Verify} exact />
                <Route path="/dashboard" component={Dashboard} exact /> 
                <Route path="/upload" component={Upload} exact />
                <Route path="/blog" component={Blog} exact /> 
                <Route path="/bugs" component={Bugs} exact /> 
            </ThemeProvider>
        </BrowserRouter>
    );
}


export default hot(module)(App);


