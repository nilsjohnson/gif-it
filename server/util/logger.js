const fs = require('fs');

const LOG_FILENAME = "log.txt";

/*
Logs to file. Creates if if it does not exist.
*/
function log(str) {
	fs.appendFile(LOG_FILENAME, str + "\n", 'utf8', function (err) {
		if (err) {
			console.log("Problem writing to file: " + err)
		}
	});
}

module.exports = log;