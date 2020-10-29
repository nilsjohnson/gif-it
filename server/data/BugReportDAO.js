const DAO = require("./DAO");
const log = require("../util/logger");

let query;

async function insertBugReport(connection, args) {
    let sql = `INSERT INTO bugReport SET ?`;
    return await query(connection, sql, args);
}

/**
 * DAO for creating and authenticating users.
 */
class BugReportDAO extends DAO {
    constructor() {
        super(10, 'localhost', 'pickles', 'goodwoofer', 'gif_it');
        query = this.query;
    }

    addBugReport(report, onSuccess, onFail) {
        this.getConnection(async connection => {
            try {
                report.date = this.getTimeStamp();
                await insertBugReport(connection, report);
                onSuccess();
            }
            catch (ex) {
                log(ex);
                onFail(ex);
            }
            finally {
                connection.release();
            }
        });
    }
}

let bugReportDAO = new BugReportDAO();
module.exports = bugReportDAO;
