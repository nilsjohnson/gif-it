const { app } = require("./server");


app.get('/user/:userId', function(req, res) {
    let userId = req.params.userId;
    console.log("fetching user: " + userId);
  
    res.status(200).send();
  
  });