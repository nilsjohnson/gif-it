import React from 'react';
import ReactDOM from 'react-dom';
import Home from './Home';
import { BrowserRouter, Route, Router } from 'react-router-dom';
import Explore from './Explore';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './theme'

import { hot } from 'react-hot-loader'

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


