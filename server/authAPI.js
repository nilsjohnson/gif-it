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

    authDAO.createNewUser(desiredUsername, email, pw).then(() => {
        res.status(201).send("New Account Created");
    }).catch(err => {
        res.status(400).send(err.message);
    });
});

app.post('/auth/login', function (req, res) {
    console.log(req.body);
    let ipAdder = req.ip;
    let password = req.body.pw;
    let usernameOrEmail = req.body.usernameOrEmail;

    authDAO.getAuthToken(usernameOrEmail, password, ipAdder)
        .then(token => {
            if (DEBUG) { console.log(`Auth Token Returned From DAO: ${token}`); }

            if(token) {
                res.json(token);
            }
            else {
                res.status(409).send({ error: "Invalid Username/Password" });
            }
            
        })
        .catch(err => {
            res.status(500).send(err);
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
