import React from 'react';
import ReactDOM from 'react-dom';
import Home from './Home';
import { BrowserRouter, Route } from 'react-router-dom';
import Explore from './Explore';
import {ThemeProvider} from '@material-ui/core/styles';
import theme from './theme'

let rootDiv = document.getElementById('root');

let router = (
	<BrowserRouter>
		<ThemeProvider theme={theme}>
			<Route path="/" component={Home} exact/>
			<Route path="/explore" component={Explore} exact/>
		</ThemeProvider>
	</BrowserRouter>
	);

ReactDOM.render(router, rootDiv);