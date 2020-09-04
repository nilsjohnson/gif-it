const { app } = require("./server");
const { makeAllPossibleTags } = require("./util/util");
const { MAX_SEARCH_INPUT_LENGTH } = require('./const');
const log = require("./util/logger");
const MediaDAO = require('./data/MediaDAO');

let mediaDAO = new MediaDAO();

app.get('/explore', function (req, res) {
    mediaDAO.getMostRecent(15, result =>  {
      if(result) {
        res.send(result);
      }
      else {
        res.status(500).send("Problem fetching new media. Sorry!");
      }
    });
});

app.get('/search', function(req, res) {
  let input = req.query.input;
  if(DEBUG) { console.log(`/api/search hit: ${input}`)};

  if(input.length > MAX_SEARCH_INPUT_LENGTH ) {
    log(`Someone entered search text more than ${MAX_SEARCH_INPUT_LENGTH} from ${req.ip}`);
    res.status(400);
    res.json({ error: `Max search query length is ${MAX_SEARCH_INPUT_LENGTH}`});
    return;
  }

  let tags = makeAllPossibleTags(req.query.input);
  mediaDAO.getGifsByTag(tags, (result => res.send(result)))
});

// TOOD return a specific error, if the gif wasn't found versus a server error
app.get('/gif/:gifId', function(req, res) {
  let gifId = req.params.gifId;
  console.log("fetching gif: " + gifId);

  mediaDAO.getGifById(gifId, (results) => {
    if(results) {
      res.json(results[0]);
    }
    else {
      res.status(500).send("Problem Fetching that gif. Sorry!");
    }
  });

});

app.get(`/popularTags/:limit`, function(req, res) {
  let limit = req.params.limit;
  limit = limit ? limit : 10;
  if(isNaN(limit) || limit > 50) {
    limit = 50;
  }

  mediaDAO.getMostPopularTags(limit, (results) => {
    if(results) {
      res.json(results);
    }
    else {
      res.status(500).send("Problem Fetching Popular Tags. Sorry!");
    }
  });
});