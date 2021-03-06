import { readAuthToken } from './util';

// note: this bool must be set propery prior to building for production
let production = true;
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
 * @param {*} type            
 */
function uploadFile(socketId, tempUploadId, data = {}, type = "") {
    return fetch(`${server}/upload/${socketId}/${tempUploadId}/${type}`, {
        method: 'POST',
        body: data,
        headers: {
            'authorization': readAuthToken()
        }
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
 * Returns a media object by its id
 * 
 * @param {*} gifId 
 */
function getMediaById(id) {
    return fetch(`${server}/media/${id}`);
}

/**
 * 
 * @param {*} limit 
 */
function getPopularTags(limit = 10) {
    return fetch(`${server}/popularTags/${limit}`);
}

// This is used for opening sockets. See Uploader/index.js for example
function getServer() { return server };

/**
 * This is used to log a user in.
 * @param {*} loginCredentials  username and password
 * @ return   A promise, where resolve contains the token as the first argument
 */
function login(loginCredentials = {}) {
    return fetch(`${server}/auth/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginCredentials)
    });
}

function checkToken() {
    return fetch(`${server}/auth/checkToken/`, {
        headers: {
            'authorization': readAuthToken()
        }
    });
}

function signUp(newUser = {}) {
    return fetch(`${server}/auth/newUser`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
    });
}

function signOut() {
    return fetch(`${server}/auth/signOut/`, {
        headers: {
            'authorization': readAuthToken()
        }
    });
}

function verifyAccount(userId, code) {
    return fetch(`${server}/verify/${userId}/${code}`);
}

function getPresignedPost(data = {}) {
    return fetch(`${server}/getPresignedPost`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'authorization': readAuthToken()
        }
    });
}

function doSignedS3Post(url = '', formData = {}) {
    return fetch(url, {
        // headers: {
        //    'Content-Type': 'multipart/form-data'
        // },
        method: 'POST',
        body: formData
    });
}

function postPhotoGallery(data) {
    return fetch(`${server}/upload/addMedia`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'authorization': readAuthToken()
        }
    });
}

function getAlbumById(albumId) {
    return fetch(`${server}/album/${albumId}`);
}

function submitBugReport(data = {}) {
    return fetch(`${server}/submitBugReport`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'authorization': readAuthToken()
        }
    });
}

function getUserMedia() {
    return fetch(`${server}/user/media/`, {
        headers: {
            'authorization': readAuthToken()
        }
    });
}

function deleteMediaById(mId = '') {
    return fetch(`${server}/user/deleteMedia/${mId}`, {
        method: 'DELETE',
        headers: {
            'authorization': readAuthToken()
        }
    });
}

function deleteAlbumById(aId = '') {
    return fetch(`${server}/user/deleteAlbum/${aId}`, {
        method: 'DELETE',
        headers: {
            'authorization': readAuthToken()
        }
    });
}

function updateMediaDescription(mId = '', description = '') {
    return fetch(`${server}/user/updateDescription/`, {
        method: 'POST',
        body: JSON.stringify({
            mId: mId,
            description: description
        }),
        headers: {
            'Content-Type': 'application/json',
            'authorization': readAuthToken()
        }
    });
}

function addTags(mId = "", tags = []) {
    return fetch(`${server}/user/addTags/`, {
        method: 'POST',
        body: JSON.stringify({
            mId: mId,
            tags: tags
        }),
        headers: {
            'Content-Type': 'application/json',
            'authorization': readAuthToken()
        }
    });
}

function deleteTags(mId = '', tags = [] ) {
    return fetch(`${server}/user/removeTags/`, {
        method: 'POST',
        body: JSON.stringify({
            mId: mId,
            tags: tags
        }),
        headers: {
            'Content-Type': 'application/json',
            'authorization': readAuthToken()
        }
    });
}

function resetPw(emailAddr = '') {
    return fetch(`${server}/auth/resetPw`, {
        method: 'POST',
        body: JSON.stringify({
            emailAddr: emailAddr
        }),
        headers: {
            'Content-Type': 'application/json',
            'authorization': readAuthToken()
        }
    });
}

function submitNewPassword(code = '', pw = "") {
    return fetch(`${server}/auth/submitNewPassword`, {
        method: 'POST',
        body: JSON.stringify({
            code: code,
            password: pw
        }),
        headers: {
            'Content-Type': 'application/json',
            'authorization': readAuthToken()
        }
    });
}

export {
    submitNewPassword,
    resetPw,
    deleteTags,
    addTags,
    updateMediaDescription,
    getAlbumById,
    postPhotoGallery,
    doSignedS3Post,
    getPresignedPost,
    verifyAccount,
    signOut,
    checkToken,
    signUp,
    login,
    getNew,
    getServer,
    getPopularTags,
    getMediaById,
    uploadFile,
    search,
    submitBugReport,
    getUserMedia,
    deleteMediaById,
    deleteAlbumById
}