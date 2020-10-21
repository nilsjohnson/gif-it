const fs = require('fs');
const moment = require("moment");
const { FilePaths } = require('../const');

const LOG_FILENAME = "log.txt";

/*
Logs to file. Creates if if it does not exist.
*/
function log(str) {
	console.log(str);
	let logStr = `${moment().format('YYYY-MM-DD HH:mm:ss')} ${str}`;
	fs.appendFile(LOG_FILENAME, logStr + "\n", 'utf8', function (err) {
		if (err) {
			console.log("Problem writing to file: " + err)
		}
	});
}

// function logBug(bugObj) {
// 	let logStr = `${moment().format('YYYY-MM-DD HH:mm:ss')} ${JSON.stringify(bugObj)}`;
// 	fs.appendFile(FilePaths.BUGS_LOG_FILE, logStr + "\n", 'utf8', function (err) {
// 		if (err) {
// 			console.log("Problem writing to file: " + err)
// 		}
// 	});
// }

module.exports = log;