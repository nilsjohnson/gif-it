const { app } = require("./server");
const log = require("./util/logger");
const AuthDAO = require("./data/AuthDAO");


let authDAO = new AuthDAO();

app.post('/auth/newUser', function (req, res) {
    console.log("auth hit");
    console.log(req.body);
    
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let password = req.body.password;
    let username = req.body.desiredUsername;

    authDAO.createNewUser(firstName, lastName, email, username, password).then(userId => {
        console.log(`New User Created. Id: ${userId}`);
        res.redirect('/dashboard?userId=' + userId);
    }).catch(err => console.log(err));
});

app.post('/auth/login', function(req, res) {
    console.log(req.body);
    let ipAdder = req.ip;
    let password = req.body.password;
    let usernameOrEmail = req.body.usernameOrEmail;
    authDAO.getAuthToken(usernameOrEmail, password, ipAdder).then(authToken => {
        res.json(authToken);
        res.status(200);
    }).catch(err => {
        res.status(401).send("Bad Login.");
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
