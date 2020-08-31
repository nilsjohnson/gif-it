const { app } = require("./server");
const log = require("./util/logger");
const AuthDAO = require("./data/AuthDAO");


let authDAO = new AuthDAO();

app.post('/auth/newUser', function (req, res) {
    console.log("auth hit");
    console.log(req.body);

    let desiredUsername = req.body.desiredUsername;
    let email = req.body.email;
    let pw = req.body.pw;

    authDAO.createNewUser(desiredUsername, email, pw).then(userId => {
        console.log(`New User Created. Id: ${userId}`);
        res.redirect('/dashboard?userId=' + userId);
    }).catch(err => console.log(err));
});

app.post('/auth/login', function (req, res) {
    console.log(req.body);
    let ipAdder = req.ip;
    let password = req.body.pw;
    let usernameOrEmail = req.body.usernameOrEmail;

    authDAO.getAuthToken(usernameOrEmail, password, ipAdder)
        .then(token => {
            console.log("Result");
            console.log(token);
            res.json(token);
        })
        .catch(err => {
            console.log("error getting auth token");
            console.log(err);
            res.status(500).send("server error");
        });
});

/**
 * Authenticates any request.
 * @param {*} userId 
 * @param {*} authToken 
 * @param {*} ipAddr 
 * @throws exception if error
 */
function authenticate(userId, authToken, ipAddr) {
    authDAO.authenticate(userId, authToken, ipAddr)
}

exports.authenticate = authenticate;
