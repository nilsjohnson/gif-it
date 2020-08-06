// note: this bool must be set propery prior to building for production
let production = true;
let server = (production ? "https://api.gif-it.io" : "http://localhost:3001");

/**
 * Makes an API call to get the newest gifs
 */
function getNew() {
    return fetch(`${server}/api/explore`);
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
  return fetch(`${server}/api/search?${paramString.toString()}`);
}

/**
 * Returns a gif by its id
 * 
 * @param {*} gifId 
 */
function getGifById(gifId) {
  return fetch(`${server}/api/${gifId}`);
}

/**
 * 
 * @param {*} limit 
 */
function getPopularTags(limit = 10) {
  return fetch(`${server}/api/popularTags/${limit}`);
}

// this is used to set the CORS policy. See UploadAPI
function getServer() { return server};

export { getServer, getPopularTags, getGifById, getNew, uploadFile, search }