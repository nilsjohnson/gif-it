const { app } = require("./server");
const { getAllGifs, getGifsByTag } = require('./dataAccess');


app.get('/api/explore', function (req, res) {
    getAllGifs(result => res.send(result));
});

app.get('/api/search', function(req, res) {
  console.log(req.query);
  let tags = req.query.input.split(" ");
  getGifsByTag(tags, (result => res.send(result)))
});

app.get('/api/:gifId', function(req, res) {
  let gifId = req.param.gifId;
  console.log(gifId);

});