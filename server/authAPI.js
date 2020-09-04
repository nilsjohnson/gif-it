const { app } = require("./server");
const log = require("./util/logger");
const AuthDAO = require("./data/AuthDAO");
const MailSender = require("./util/sendMail");

// for sending verification codes
const mailSender = new MailSender();
// for accessing db
let authDAO = new AuthDAO();

app.post('/auth/newUser', function (req, res) {
    let desiredUsername = req.body.desiredUsername;
    let email = req.body.email;
    let pw = req.body.pw;

    authDAO.createNewUser(desiredUsername, email, pw).then(result => {
        const { userId, verificationCode } = result;
        mailSender.sendVerificationEmail(email, desiredUsername, userId, verificationCode, () => {
            res.status(201).send("New Account Created");
        }, () => {
            if(DEV) {
                console.log("emailing auth failed, probably cause we're in DEV mode. So, we will go ahead and just verify this account.");
                authDAO.verifyUserEmailAddr(userId, verificationCode).then(result => {
                    console.log(result);
                }).catch(err => console.log(err));
            }
            else {
                log(`${desiredUsername} did not get sent an email. Their Code is ${verificationCode}`);
            }
            res.status(201).send("New Account Created");
        } );
    }).catch(err => {
        res.status(400).send(err.message);
    });
});

app.post('/auth/login', function (req, res) {
    let ipAdder = req.ip;
    let password = req.body.pw;
    let usernameOrEmail = req.body.usernameOrEmail;

    authDAO.logIn(usernameOrEmail, password, ipAdder)
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
    authDAO.verifyUserEmailAddr(parseInt(userId), code).then(result => {
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
