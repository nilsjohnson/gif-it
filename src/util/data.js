function getNew() {
    return fetch("/api/explore", {

    });
}

function uploadFile(url = '', data = {}) {
    console.log('build fetch request');
    return fetch(url, {
      method: 'POST',
      body: data
    });
  }

export { getNew, uploadFile };