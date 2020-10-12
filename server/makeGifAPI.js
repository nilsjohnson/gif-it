const path = require('path');
const { http } = require('./server');
const { FilePaths } = require('./const');


const log = require('./util/logger');
let io = require('socket.io')(http)

io.set('origins', DEV ? 'http://localhost:3000' : 'https://gif-it.io:*');

/**
 * Holds open connections - { socketId_1 : { socket: socket, uploads: {} }, socketId_2 : .... }
 */
let connections = {};










/**
 * defines new listeners for this socket
 */
function addEventHandlers(newSocket, socketId) {
  
}



/**
 * Given an upload and a socket, defines the socket listeners to handle
 * client/server communication.
 * @param {*} socketId 
 * @param {*} socket 
 * @param {*} uploadId 
 * @param {*} upload 
 */
function addGifMakerUpload(socketId, socket, uploadId, upload) {
  // if this socket already has uploads associated with it
  if (connections[socketId]) {
    connections[socketId].uploads[uploadId] = upload;
  }
  else {
    connections[socketId] = {};
    connections[socketId].uploads = {};
    connections[socketId].uploads[uploadId] = upload;
    connections[socketId].socket = socket;
    addEventHandlers(socket, socketId);
  }
}

exports.addGifMakerUpload = addGifMakerUpload;