/*
If running in production on server, pass 'prudction' as an argument:
	$ node server.js -p
This will allow listening for https requests, otherwise it will just do http.	
*/
const PRODUCTION = 1;
const DEV = 0;
const HTTP_PORT_NUM = 3001;
let mode;

if (process.argv.length > 2 && process.argv[2] === "-p") {
	console.log("Server running in prodcution. Will listen for https requests.");
	mode = PRODUCTION;
}
else {
	mode = DEV;
	console.log("Server running in DEV mode. Will not listen for https requests");
}

// imports
const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);

// exports
exports.app = app;
exports.http = http;

// APIs
require('./uploadAPI.js');



// Index routing and reidrects
// { index : false } is to allow request for the webroot to get caught 
// by 'app.get('/*', function(req, res)', allowing http to https redirects
app.use(express.static(path.join(__dirname, '../build'), { index: false }));
app.use(express.static(path.join(__dirname, '../public'), { index: false }));

app.get('/*', function (req, res) {
	if (mode === PRODUCTION) {
		// TODO handle https redirects here
	}
	else if(mode === DEV) {
		res.sendFile(path.join(__dirname, '../public', 'index.html'));
	}

});



/*
Starts server
*/
// app.listen(HTTP_PORT_NUM, function () {
// 	console.log(`App listening on port ${HTTP_PORT_NUM}`);
// });

http.listen(HTTP_PORT_NUM, () => {
    console.log(`App listening on port ${HTTP_PORT_NUM}`);
});

/*
Starts listening for https requests
*/
if (mode == PRODUCTION) {
	// https.createServer(OPTIONS, app).listen(HTTPS_PORT_NUM);
}