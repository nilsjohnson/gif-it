const { app } = require("./server");
const log = require("./util/logger");
const AuthDAO = require("./data/AuthDAO");
const MailSender = require("./util/sendMail");
const { NewUserError, LoginError } = require("./data/dataAccessErrors");

const mailSender = new MailSender();
let authDAO = new AuthDAO();

/**
 * For creating new users
 */
app.post('/auth/newUser', function (req, res) {
    let desiredUsername = req.body.desiredUsername;
    let email = req.body.email;
    let pw = req.body.pw;
    let ipAdder = req.ip;

    authDAO.createNewUser(desiredUsername, email, pw, ipAdder, 
        (userId, verificationCode, token) => {
        // onSuccess, user inserted
        mailSender.sendVerificationEmail(email, desiredUsername, userId, verificationCode, () => {
            // mail sent.
            res.status(201).send(token);
        }, () => {
            // mail not sent. Send a 201 anyway.
            res.status(201).send(token);
        });

    }, err => {
        // onFail, user not inserted
        switch (err) {
            case NewUserError.USERNAME_TAKEN:
                res.status(400).send("Sorry, username taken.");
                break;
            case NewUserError.EMAIL_ADDR_IN_USE:
                res.status(400).send("There is already an account associated with this email.");
                break;
            default:
                res.status(500).send("An error occured. Try again later.");
        }
    });
});


app.post('/auth/login', function (req, res) {
    let ipAdder = req.ip;
    let password = req.body.pw;
    let usernameOrEmail = req.body.usernameOrEmail;

    authDAO.logIn(usernameOrEmail, password, ipAdder, (token) => {
        // onSuccess
        console.log(token);
        res.json(token);
    }, err => {
        // onFail
        console.log(err);
        switch(err) {
            // case LoginError.NOT_VERIFIED:
            //     // at this point, we dont require user verification to use site.
            //     res.status(200).send("Account is not verified.");
            //     break;
            case LoginError.INVALID_USERNAME_PASSWORD:
                res.status(401).send("Invalid username/password.");
                break;
            default:
                res.status(500).send("Unable to log in. Please try later.");
        }
        
    });
});

app.get('/auth/checkToken/', function (req, res) {
    if (authDAO.authenticate(req.headers)) {
        res.status(200).send();
    }
    else {
        res.status(401).send();
    }
});

app.get('/verify/:userId/:code', function (req, res) {
    console.log("verify hit");
    let userId = req.params.userId;
    let code = req.params.code;
    console.log("code: " + code);
    console.log("userId " + userId);
    authDAO.verifyUserEmailAddr(parseInt(userId), code, req.ip).then(token => {
        console.log(token);
        res.status(200).send({
            message: "Verification Success.",
            token: token
        });
    }).catch(err => {
        console.log(err);
        res.status(400).send({ message: err });
    });
});

app.get('/auth/signOut', function (req, res) {
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
    authDAO.authenticate(userId, authToken, ipAddr);
}

exports.authenticate = authenticate;
