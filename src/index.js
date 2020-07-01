import React from 'react';
import ReactDOM from 'react-dom';
import Home from './Home';
import { BrowserRouter, Route } from 'react-router-dom';
import Explore from './Explore';

let rootDiv = document.getElementById('root');

let router = (
	<BrowserRouter>
		<div>
			<Route path="/" component={Home} exact/>
			<Route path="/explore" component={Explore} exact/>
		</div>
	</BrowserRouter>
	);

ReactDOM.render(router, rootDiv);