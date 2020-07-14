import React from 'react';
import Home from './Home';
import { BrowserRouter, Route } from 'react-router-dom';
import Explore from './Explore';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './theme';
import { hot } from 'react-hot-loader';
import './css/style.css';

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <Route path="/" component={Home} exact />
                <Route path="/explore" component={Explore} exact />
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default hot(module)(App);


