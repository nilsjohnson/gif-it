function getNew() {
    return fetch("/api/explore");
}

function uploadFile(url = '', data = {}) {
    return fetch(url, {
      method: 'POST',
      body: data
    });
}

function search(searchInput) { 
  console.log("data.search: " + searchInput);
  const params = { input: searchInput };
  const paramString = new URLSearchParams(params);
  return fetch(`/api/search?${paramString.toString()}`);
}

function getGifById(gifId) {
  let endpoint = `/api/${gifId}`;
  console.log(endpoint);
  return fetch(endpoint);
}

function getPopularTags(limit = 10) {
  return fetch(`/api/popularTags/${limit}`);
}

export { getPopularTags, getGifById, getNew, uploadFile, search }