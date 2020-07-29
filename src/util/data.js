let production = true;
let server = (production ? "https://api.gif-it.io" : "http://localhost:3001");

function getNew() {
    return fetch(`${server}/api/explore`);
}

// `/api/videoUpload/${this.socket.id}/${tempUploadId}`
function uploadFile(socketId, tempUploadId, data = {}) {
    console.log(socketId);
    return fetch(`${server}/api/videoUpload/${socketId}/${tempUploadId}`, {
      method: 'POST',
      body: data
    });
}

function search(searchInput) { 
  console.log("data.search: " + searchInput);
  const params = { input: searchInput };
  const paramString = new URLSearchParams(params);
  return fetch(`${server}/api/search?${paramString.toString()}`);
}

function getGifById(gifId) {
  return fetch(`${server}/api/${gifId}`);
}

function getPopularTags(limit = 10) {
  return fetch(`${server}/api/popularTags/${limit}`);
}

function getServer() { return server};

export { getServer, getPopularTags, getGifById, getNew, uploadFile, search }