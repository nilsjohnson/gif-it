function getNew() {
    return fetch("/api/explore", {

    });
}

function uploadFile(url = '', data = {}) {
    return fetch(url, {
      method: 'POST',
      body: data
    });
  }

export { getNew, uploadFile };