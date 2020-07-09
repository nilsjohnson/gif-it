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

export { getNew, uploadFile, search };