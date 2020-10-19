const { app } = require("./server");
const logBug = require("./util/logger");


app.post(`/submitBugReport`, function (req, res) {
    console.log("bug api hit")
    logBug(req.body);
    res.status(200).send();
});
