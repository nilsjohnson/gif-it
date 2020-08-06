const log = require("./util/logger");
const moment = require("moment");

function terminate (server, options = { coredump: false, timeout: 500 }) {
    // Exit function
    const exit = code => {
      options.coredump ? process.abort() : process.exit(code)
    }
  
    return (code, reason) => (err, promise) => {
      if (err && err instanceof Error) {
      // Log error information, use a proper logging library here :)
      console.log(err.message, err.stack);

      log(`${moment().format('YYYY-MM-DD HH:mm:ss')} ${err.message} \n${err.stack})\n`);
      }
  
      // Attempt a graceful shutdown
      server.close(exit)
      setTimeout(exit, options.timeout).unref()
    }
  }
  
  module.exports = terminate