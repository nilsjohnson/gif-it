const { app } = require("./server");
const log = require("./util/logger");
const AuthDAO = require("./data/AuthDAO");
const MailSender = require("./util/sendMail");

const mailSender = new MailSender


let authDAO = new AuthDAO();

app.post('/auth/newUser', function (req, res) {
    console.log("auth hit");
    console.log(req.body);

    let desiredUsername = req.body.desiredUsername;
    let email = req.body.email;
    let pw = req.body.pw;

    authDAO.createNewUser(desiredUsername, email, pw).then(result => {
        const { userId, verificationCode } = result;
        mailSender.sendVerificationEmail(email, desiredUsername, userId, verificationCode, () => {
            res.status(201).send("New Account Created");
        }, () => {
            // failure :(
            // we still send 201 because it was an email issue, not an account creation issue.
            res.status(201).send("New Account Created");
        } );
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


app.get('/auth/checkToken/', function(req, res) {
    console.log("check token hit");
    if(authDAO.authenticate(req.headers)) {
        res.status(200).send();
    }
    else {
        res.status(400).send();
    }
});

app.get('/verify/:userId/:code', function(req, res) {
    console.log("verify hit");
    let userId = req.params.userId;
    let code = req.params.code;
    console.log("code: " + code);
    console.log("userId " + userId);
    authDAO.verifyUser(parseInt(userId), code).then(result => {
        console.log(result);
        res.status(200).send({message: result});
    }).catch(err => {
        console.log(err);
        res.status(400).send({message: err});
    });
});

app.get('/auth/signOut', function(req, res) {
    authDAO.signUserOut(req.headers);
    res.status(200).send();
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
