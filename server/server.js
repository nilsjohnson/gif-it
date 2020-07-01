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

const { Ports, ServeModes, FilePaths} = require('./const');

// default serv mode and debug
let serveMode = ServeModes.DEV;
global.DEBUG = false;

for(let i = 0; i < process.argv.length; i++) {
	switch(process.argv[i]) {
		case '-p':
			serveMode = ServeModes.PRODUCTION;
			break; 
		case '-d':
			DEBUG = true;
			break;	
	}
}

if(DEBUG) {
	console.log("App in debug mode.");
}

if(serveMode === ServeModes.DEV) {
	console.log("App in development mode.")
}

let httpsServer;

if(serveMode == ServeModes.PRODUCTION) {
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
exports.https = httpsServer;
exports.serveMode = serveMode;

// APIs
require('./uploadAPI');
require('./dataAccess')
require('./exploreAPI');

// { index : false } is to allow request for the webroot to get caught by app.get('/*'...)
// since we need to handle redirects to https
app.use(express.static(path.join(__dirname, '../build'), { index: false }));
app.use(express.static(FilePaths.GIF_SERVE_DIR, { index: false }));

app.get('/*', function (req, res) {
	if (serveMode === ServeModes.PRODUCTION) {
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
	else if(serveMode === ServeModes.DEV) {
		res.sendFile(path.join(__dirname, '../build', 'index.html'));
	}
});

http.listen(Ports.HTTP_PORT_NUM, () => {
    console.log(`App listening on port ${Ports.HTTP_PORT_NUM}`);
});

if (serveMode === ServeModes.PRODUCTION) {
	console.log("Serving over https.")
	httpsServer.listen(Ports.HTTPS_PORT_NUM);
}
