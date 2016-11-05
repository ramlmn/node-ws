'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

let WebSocketUser = require('./user.js');




// Setting up the server part
const PORT = 8000;
const INDEX = path.join(__dirname, 'index.html');

// Create HTTP server for use with WebSocket
const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });




// Create required variables
let rooms = new Map();
let users = new Map();

// Number of users that can fit in a room
const ROOM_LIMIT = 2;




// Manage the connection
wss.on('connection', (client) => {

  let user = new WebSocketUser(client);

  user.on('message', (msg) => {

    try {
      // Try to parse the data
      msg = JSON.parse(msg);
    } catch (err) {
      // If the data is not JSON
      // then just return
      console.log('Received non JSON value');
      return;
    }

    if (msg.type === 'join') {

      let room = msg.room;

      // Check if the request has a room name in it
      if (room) {

        // If the room already exists
        if (rooms.has(room)) {

          // Check room limit
          if (rooms.get(room).length < ROOM_LIMIT) {

            // Join the room
            user.room = room;
            users.set(user.id, user);
            rooms.get(user.room).push(user.id);

          } else {

            // Tell the user that the room is full
            user.send({
              type: 'error',
              body: `Room '${user.room}' id full!`
            });

            // And close the connection
            user.close();
            return;

          }

        } else {

          // Room doesn't exist, so create it
          user.room = room;
          users.set(user.id, user);
          rooms.set(user.room, [user.id]);

        }

        console.log(`Client joined: ${user.id}`);
        console.log(`Total users: ${users.size}`);

        // Conencted, notify back
        user.send({
          type: 'success',
          body: `You've successfully joined ${user.room}`
        });

        // Notify the other user in current room
        rooms.get(user.room).forEach(id => {

          if (id !== user.id) {
            users.get(id).send({
              type: 'notif',
              body: 'Someone joined the room'
            });
          }

        });

      }

    } else if(msg.type === 'msg') {

      // Verify if the room actually exists
      // and if actually the user has joined a room
      // if not then return
      if (!(user.room && rooms.get(user.room).includes(user.id))) {
        return;
      }

      // The user actually exists now
      // Just send the message to other user in the room
      rooms.get(user.room).forEach(id => {

        if (id !== user.id) {
          users.get(id).send(msg);
        }

      });

    } else if (msg.type === 'leave') {
      // Leave the room, don't close connection
      rooms.get(user.room).filter((id) => {
        return user.id !== id;
      });

      users.delete(user.id);

      // Notify the other users
      rooms.get(user.room).forEach(id => {
        if (id !== user.id) {

          try {
            // Try to send the disconnect
            // the other user might not be available
            users.get(id).send({
              type: 'notif',
              body: `${user.id} left the room!`
            });
          } catch (err) {
            console.error('Failed to send data');
          }

        }
      });

    }

  });

  console.log(`New client: ${user.id}`);

  user.on('close', () => {

    console.log(`Client disconnected: ${user.id}!`);

    // Check if a user is in that room he pretends to be
    if (rooms.get(user.room).includes(user.id)) {

      // Notify the other users
      rooms.get(user.room).forEach(id => {
        if (id !== user.id) {

          try {
            // Try to send the disconnect
            // the other user might not be available
            users.get(id).send({
              type: 'notif',
              body: `${user.id} left the room!`
            });
          } catch (err) {
            console.error('Failed to send data');
          }

        }
      });

      // Remove user from rooms
      rooms.get(user.room).filter(id => {
        return id !== user.id;
      });

      // Remove the room if no one is in it
      if (rooms.get(user.room).length < 1) {
        rooms.delete(use.room);
      }

      // Remove the user from the Map
      users.delete(user.id);

    }

    console.log(`Total users: ${users.size}`);

  });

});
