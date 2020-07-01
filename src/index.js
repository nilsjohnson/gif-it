import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter, Route } from 'react-router-dom';
import Explore from './Explore';

let rootDiv = document.getElementById('root');

let router = (
	<BrowserRouter>
		<div>
			<Route path="/" component={App} exact/>
			<Route path="/explore" component={Explore} exact/>
		</div>
	</BrowserRouter>
	);

ReactDOM.render(router, rootDiv);