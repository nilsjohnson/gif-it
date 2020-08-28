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

app.post('auth/login', function(req, res) {
    let 

});
