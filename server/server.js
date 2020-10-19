global.DEBUG = false;
global.DEV = false;

for (let i = 2; i < process.argv.length; i++) {
	switch (process.argv[i]) {
		case '--debug':
			DEBUG = true;
			break;
		case '--dev':
			DEV = true;
			break;
		default:
			console.log(`${process.argv[i]} is not a command.`);
			console.log(`usage: [--dubug] [--dev]`);
			console.log(`Use --debug to print debug statements. Use --dev to not do s3 transfers and serve the gifs using this app.`);
			process.exit();
	}
}
const { FilePaths, PORT_NUM } = require('./const');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const cors = require('cors');
const terminate = require('./terminate');

let corsOptions = {
	origin: 'https://gif-it.io',
	optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

if (DEBUG) {
	console.log("DEBUG set to true. App will print debug statements.");
}
if (DEV) {
	console.log("DEV set to true. Using test s3 bucket.");
	corsOptions = {
		origin: 'http://localhost:3000',
		optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
	}
	app.use(express.static(FilePaths.GIF_SAVE_DIR, { index: false }));
}

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// exports
exports.app = app;
exports.http = http;

// define APIs
require('./exploreAPI');
require('./uploadAPI');
require('./authAPI');
require('./userAPI');
require('./clientS3TransferAPI');
require('./bugAPI');

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