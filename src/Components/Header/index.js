import React from 'react';
import './style.css';


const Header = ( props ) => (
    <div id="main-header">
		<h1>gif-it.io</h1>
		<nav id="main-navbar">
			{ <ul>
				<li>
					<a href="/">Convert to .gif</a>
				</li>
				<li>
					<a href="/explore">Explore</a>
				</li>
			</ul>}
		</nav>
	</div>
);




export default Header;