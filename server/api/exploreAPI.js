const { app } = require("../server");
const { makeAllPossibleTags } = require("../util/util");
const { MAX_SEARCH_INPUT_LENGTH } = require('../const');
const log = require("../util/logger");
const mediaDAO = require('../data/MediaDAO');

app.get('/explore', function (req, res) {
    console.log("hit");
    // TODO this actually gets random at the moment, until we have more users...
    mediaDAO.getMostRecent(30, result => {
        // on success
        res.send(result);
    }, err => {
        // on error
        log(err);
        res.status(500).send("Problem fetching new media. Sorry!");
    });
});

app.get('/search', function (req, res) {
    let input = req.query.input;

    if (input.length > MAX_SEARCH_INPUT_LENGTH) {
        log(`Someone entered search text more than ${MAX_SEARCH_INPUT_LENGTH} from ${req.ip}`);
        res.status(400);
        res.json({ error: `Max search query length is ${MAX_SEARCH_INPUT_LENGTH}` });
        return;
    }

    let tags = makeAllPossibleTags(req.query.input);
    mediaDAO.getGifsByTag(tags, result => {
        res.send(result)
    }, err => {
        res.status(500).send(err);
    });
});


app.get('/media/:mId', function (req, res) {
    let mId = req.params.mId;
    console.log("fetching gif: " + mId);

    mediaDAO.getMediaById(mId, (media) => {
        console.log("media:");
        console.log(media);
        // onSucess
        if (media) {
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

app.get(`/popularTags/:limit`, function (req, res) {
    let limit = req.params.limit;
    limit = limit ? limit : 10;
    if (isNaN(limit) || limit > 50) {
        limit = 50;
    }

    mediaDAO.getMostPopularTags(limit, (results) => {
        if (results) {
            res.json(results);
        }
        else {
            res.status(500).send("Problem Fetching Popular Tags. Sorry!");
        }
    });
});

app.get(`/album/:albumId`, function (req, res) {
    let albumId = req.params.albumId;

    mediaDAO.getAlbumById(albumId, (album) => {
        if (!album) {
            res.status(404).send();
            return;
        }
        res.json(album);
    }, err => {
        res.status(500).send(err);
    });
});




