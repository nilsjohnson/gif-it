/*
If running in production on server, pass 'prudction' as an argument:
	$ node server.js -p
This will allow listening for https requests, otherwise it will just do http.	
*/
const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const https = require('https');
const fs = require('fs');

const PRODUCTION = 1;
const DEV = 0;
const HTTP_PORT_NUM = 3001;
const HTTPS_PORT_NUM = 443;


// to signal if we are serving https
let serveMode;

// to see if the production flag was passed in
if (process.argv.length > 2 && process.argv[2] === "-p") {
	console.log("Server running in prodcution. Will listen for https requests.");
	serveMode = PRODUCTION;
}
else {
	serveMode = DEV;
	console.log("Server running in DEV mode. Will not listen for https requests");
}

let httpsServer;

if(serveMode == PRODUCTION) {
	const FULL_CHAIN = '/etc/letsencrypt/live/gif-it.io/cert.pem';
	const PRIVATE_KEY = '/etc/letsencrypt/live/gif-it.io/privkey.pem';
	const OPTIONS = {
		cert: fs.readFileSync(FULL_CHAIN),
		key: fs.readFileSync(PRIVATE_KEY),
		requestCert: true,
		rejectUnauthorized: false,
	};
	console.log("creating https server..");
	httpsServer = https.createServer(OPTIONS, app);
}


// exports
exports.app = app;
exports.http = http;
exports.serveMode = serveMode;
exports.https = httpsServer;

// APIs
require('./uploadAPI.js');

// { index : false } is to allow request for the webroot to get caught by app.get('/*'...)
// since we need to handle redirects to https
app.use(express.static(path.join(__dirname, '../build'), { index: false }));
app.use(express.static(path.join(__dirname, '../gifs'), { index: false }));

app.get('/', function (req, res) {
	console.log("Hello amanda :)");
	if (serveMode === PRODUCTION) {
		let usingHttps = req.secure;
		let hasSubDomain = req.headers.host.startsWith("www");

		// good, this is how we serve this site.
		if(usingHttps && !hasSubDomain) {
			res.sendFile(path.join(__dirname, '../build', 'index.html'));
		}
		else {
			res.redirect("https://gif-it.io");
		}
	}
	else if(serveMode === DEV) {
		res.sendFile(path.join(__dirname, '../build', 'index.html'));
	}
});

http.listen(HTTP_PORT_NUM, () => {
    console.log(`App listening on port ${HTTP_PORT_NUM}`);
});

if (serveMode === PRODUCTION) {
	httpsServer.listen(HTTPS_PORT_NUM);
}
