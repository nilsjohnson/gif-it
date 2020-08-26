const { app } = require("./server");
const { getAllGifs: getMostRecent, getGifsByTag, getGifById, getMostPopularTags } = require('./util/dataAccess');
const { makeAllPossibleTags } = require("./util/util");
const { MAX_SEARCH_INPUT_LENGTH } = require('./const');
const log = require("./util/logger");

app.get('/api/explore', function (req, res) {
    getMostRecent(15, result => res.send(result));
});

app.get('/api/search', function(req, res) {
  let input = req.query.input;
  if(DEBUG) { console.log(`/api/search hit: ${input}`)};
  
  console.log(MAX_SEARCH_INPUT_LENGTH);
  if(input.length > MAX_SEARCH_INPUT_LENGTH ) {
    log(`Someone entered search text more than ${MAX_SEARCH_INPUT_LENGTH} from ${req.ip}`);
    res.status(400);
    res.json({ error: `Max search query length is ${MAX_SEARCH_INPUT_LENGTH}`});
    return;
  }

  let tags = makeAllPossibleTags(req.query.input);
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