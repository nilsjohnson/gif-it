/*
Usage:
--debug		App will print debug statements
--dev 		App in "dev" mode and wont transfer objects to s3
 */

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const cors = require('cors');
const terminate = require('./terminate');
const { FilePaths, PORT_NUM } = require('./const')

let corsOptions = {
	origin: 'https://gif-it.io',
	optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }


// default serve mode and debug
global.DEBUG = false;
global.DEV = false;

for(let i = 2; i < process.argv.length; i++) {
	switch(process.argv[i]) { 
		case '--debug':
			DEBUG = true;
			console.log("App set to print DEBUG statements.");
			break;	
		case '--dev':
			DEV = true;
			console.log("DEV set to true. Gifs will be served from this server and objects will not be written to s3.");
			corsOptions = {
				origin: 'http://localhost:3000',
				optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
			  }
			app.use(express.static(FilePaths.GIF_SAVE_DIR, { index: false }));
			break;
		default:
			console.log(`${process.argv[i]} is not a command.`);
			console.log(`usage: [--dubug] [--dev]`);
			console.log(`Use --debug to print debug statements. Use --dev to not do s3 transfers and serve the gifs using this app.`);	  
			process. exit();  
		}
}

app.use(cors(corsOptions));
app.use(bodyParser.json());

// exports
exports.app = app;
exports.http = http;

// define APIs
require('./util/dataAccess')
require('./exploreAPI');
require('./uploadAPI');

// listen for API requests
http.listen(PORT_NUM, () => {
	console.log(`App listening on port ${PORT_NUM}`);
});

const exitHandler = terminate(http, {
	coredump: false,
	timeout: 500
});

process.on('uncaughtException', exitHandler(1, 'Unexpected Error'))
process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'))
process.on('SIGTERM', exitHandler(0, 'SIGTERM'))
process.on('SIGINT', exitHandler(0, 'SIGINT'))