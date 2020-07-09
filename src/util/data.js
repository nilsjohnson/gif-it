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
  return fetch("/api/explore", {
    method: "GET",
    body: searchInput
  });
}



export { getNew, uploadFile };