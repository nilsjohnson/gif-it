const { app } = require("./server");
const { makeAllPossibleTags } = require("./util/util");
const { MAX_SEARCH_INPUT_LENGTH } = require('./const');
const log = require("./util/logger");
const MediaDAO = require('./data/MediaDAO');
const AuthDAO = require("./data/AuthDAO");

let mediaDAO = new MediaDAO();
let authDAO = new AuthDAO();

app.get('/explore', function (req, res) {
  console.log("hit");
  mediaDAO.getMostRecent(30, result => {
    // on success
    console.log("Getting most recent success.");
    console.log(result);
    res.send(result);
  }, err => {
    // on error
    log(err);
    res.status(500).send("Problem fetching new media. Sorry!");
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
  mediaDAO.getGifsByTag(tags, result => {
    res.send(result)},
    err => {
      res.status(500).send(err);
    });
});


app.get('/media/:mId', function(req, res) {
  let mId = req.params.mId;
  console.log("fetching gif: " + mId);

  mediaDAO.getMediaById(mId, (media) => {
    console.log("media:");
    console.log(media);
    // onSucess
    if(media) {
      res.json(media);
    }
    else {
      res.sendStatus(404);
    }
  }, err => {
    // onFail
    log(err);
    res.sendStatus(500);
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

app.get(`/album/:albumId`, function(req, res) {
  let albumId = req.params.albumId;
  
  if(DEBUG) {
    console.log('Looking for album: ' + albumId);
  }

  mediaDAO.getAlbumById(albumId, (album) => {
    if(DEBUG) {
      console.log("here is the album: ");
      console.log(album);

      if(!album) {
        console.log("sending 404");
        res.status(404).send();
        return;
      }
    }
    res.json(album);
  }, err => {
    res.status(500).send(err);
  });
});

app.get(`/user/media`, function(req, res) {
  console.log("Im it.");
  let userId = authDAO.authenticate(req.headers);

  if(!userId) {
    res.status(500).send("user not authenticated");
    return;
  }
  console.log("found user: " + userId);
  

  mediaDAO.getMediaByUserId(userId, (media) => {
      console.log("onsuccess");
      console.log(media);
      res.send(media)
  }, err => {
    console.log(err);
    res.status(500).send(err);
  });
});

app.delete(`/user/deleteMedia/:mId`, function(req, res) {
  let userId = authDAO.authenticate(req.headers);
  let mId = req.params.mId;
  console.log(mId + " delete req.");

  // deleteMediaById(userId, mId, onSuccess, onFail) {

  mediaDAO.deleteMediaById(userId, mId, () => {
    // success
    res.status(200).send();
  }, () => {
    // failure
    res.status(500).send();
  });

  res.status(200).send();

});

app.delete(`/user/deleteAlbum/:aId`, function(req, res) {
  let userId = authDAO.authenticate(req.headers);
  let aId = req.params.aId;
  console.log(aId + " delete req.");


  mediaDAO.deleteAlbumById(userId, aId, () => {
    // success
    res.status(200).send();
  }, () => {
    // failure
    res.status(500).send();
  });

  res.status(200).send();

});
