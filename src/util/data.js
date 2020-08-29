// note: this bool must be set propery prior to building for production
let production = false;
let server = (production ? "https://api.gif-it.io" : "http://localhost:3001");

/**
 * Makes an API call to get the newest gifs
 */
function getNew() {
    return fetch(`${server}/explore`);
}

/**
 * Uploads a file to the server. To use this method, we must already have a socket open.
 * 
 * @param {*} socketId        The Id of the clients socket
 * @param {*} tempUploadId    A temporary upload Id
 * @param {*} data            The file
 */
function uploadFile(socketId, tempUploadId, data = {}) {
    console.log(socketId);
    return fetch(`${server}/api/videoUpload/${socketId}/${tempUploadId}`, {
      method: 'POST',
      body: data
    });
}

/**
 * For when a user searches for a gif
 * 
 * @param {*} searchInput   The text the user entered as a search query
 */
function search(searchInput) { 
  const params = { input: searchInput };
  const paramString = new URLSearchParams(params);
  return fetch(`${server}/search?${paramString.toString()}`);
}

/**
 * Returns a gif by its id
 * 
 * @param {*} gifId 
 */
function getGifById(gifId) {
  return fetch(`${server}/gif/${gifId}`);
}

/**
 * 
 * @param {*} limit 
 */
function getPopularTags(limit = 10) {
  return fetch(`${server}/popularTags/${limit}`);
}

// This is used for opening sockets. See Uploader/index.js
function getServer() { return server};

function login() {
  return
}

export { getServer, getPopularTags, getGifById, getNew, uploadFile, search }