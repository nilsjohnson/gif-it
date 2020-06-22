import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter, Route } from 'react-router-dom';

let rootDiv = document.getElementById('root');

let router = (
	<BrowserRouter>
		<div>
			<Route path="/" component={App} exact/>
		</div>
	</BrowserRouter>
	);

ReactDOM.render(router, rootDiv);