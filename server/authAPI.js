const { app } = require("./server");
const log = require("./util/logger");

app.post('/auth/newUser', function (req, res) {
    console.log("auth hit");
    console.log(req.body);
    
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let password = req.body.password;


    

    res.send(200);
});
