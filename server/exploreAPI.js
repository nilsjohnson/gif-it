const { app } = require("./server");
const { getAllGifs: getMostRecent, getGifsByTag, getGifById, getMostPopularTags } = require('./dataAccess');


app.get('/api/explore', function (req, res) {
    getMostRecent(15, result => res.send(result));
});

app.get('/api/search', function(req, res) {
  console.log(req.query);
  let tags = req.query.input.split(" ");
  getGifsByTag(tags, (result => res.send(result)))
});

app.get('/api/:gifId', function(req, res) {
  let gifId = req.params.gifId;
  console.log("fetching gif: " + gifId);

  getGifById(gifId, (results) => {
    res.json(results[0]);
  });

});

// TODO validate limit is actually a number
app.get(`/api/popularTags/:limit`, function(req, res) {
  let limit = req.params.limit;
  limit = limit ? limit : 10;
  if(limit > 50) {
    limit = 50;
  }

  console.log("limit: " + limit);

  getMostPopularTags(limit, (results) => {
    console.log(results);
    res.json(results);
  });

});