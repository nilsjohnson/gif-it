/*
This is the entry point to the application's api.

To run in production mode and serve https with requests going to 'api.gif-it.io'
	$ node ./server/server.js -p 

To run in dev mode and server http with requests going to 'localhost'		
	$ node ./server/server.js
	
Additionally, you may also pass in the -d flag if you wish to print debug statements.	
 */

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
let { Ports, ServeModes, FilePaths } = require('./const');

app.options('/api/videoUpload/:socketId/:tempUploadId', cors());
// since our server is on the 'api.gif-it' subdomain, we need cors
app.use(cors()); // TODO I think we can pass in arguments to only allow cross origin reqests from the api subdomain



// to read bodys as JSON
app.use(bodyParser.json());

// default serve mode and debug
global.SERVE_MODE = ServeModes.DEV;
global.DEBUG = false;

for(let i = 0; i < process.argv.length; i++) {
	switch(process.argv[i]) {
		case '-p':
			SERVE_MODE = ServeModes.PRODUCTION;
			break; 
		case '-d':
			DEBUG = true;
			break;	
	}
}

if(DEBUG) {
	console.log("App set to print DEBUG statements.");
}

let httpsServer;

// if production get the ssl cert and create https server
if(SERVE_MODE === ServeModes.PRODUCTION) {
	const FULL_CHAIN = '/etc/letsencrypt/live/api.gif-it.io/cert.pem';
	const PRIVATE_KEY = '/etc/letsencrypt/live/api.gif-it.io/privkey.pem';
	const OPTIONS = {
		cert: fs.readFileSync(FULL_CHAIN),
		key: fs.readFileSync(PRIVATE_KEY),
		requestCert: true,
		rejectUnauthorized: false,
	};
	console.log("creating https server..");
	httpsServer = https.createServer(OPTIONS, app);
}
// otherwise we skip that step and serve a gif directory (since we dont have a dev s3 bucket set up)
else if(SERVE_MODE === ServeModes.DEV) {
	console.log(`App in development mode.`);
	console.log(`Serving gifs from ${FilePaths.GIF_SAVE_DIR}`);
	app.use(express.static(FilePaths.GIF_SAVE_DIR, { index: false }));
}


// exports
exports.app = app;
exports.http = http;
exports.https = httpsServer;

// define APIs
require('./uploadAPI');
require('./dataAccess')
require('./exploreAPI');

// listen for API requests
http.listen(Ports.HTTP_PORT_NUM, () => {
    console.log(`App listening on port ${Ports.HTTP_PORT_NUM}`);
});
// listen for https
if (SERVE_MODE === ServeModes.PRODUCTION) {
	console.log("Serving over https.")
	httpsServer.listen(Ports.HTTPS_PORT_NUM);
}