'use strict';

let userids = new Set();


class WebSocketUser {

  constructor(client) {

    // Generate a new uniqid for the user
    this._id = WebSocketUser.uniqid;

    // Store the ws object as client
    this._client = client;

    // The user is immediately not joined a room
    // We add the user to a room later
    this._room = null;

  }

  get id() {
    return this._id;
  }
 
  set room(room) {
    this._room = room;
  }

  get room() {
    return this._room;
  }

  static get uniqid() {

    // Generate a random number and convert to Base36
    let v = (Math.random() * 1e18).toString(36);

    // Check if the value is already generated
    if (userids.has(v)) {

      // If the value already exists
      // generate a new one
      let c = WebSocketUser.uniqid;

      // Store the new value
      userids.add(c);

      // return the new value
      return c;

    } else {

      // Store the value and return it
      userids.add(v);
      return v;

    }
  }

  send(msg) {
    // Send the message 
    this._client.send(JSON.stringify(msg));
  }

  on(event, callback) {

    // Attach and propagate valid events only
    if (['open', 'close', 'message'].includes(event)) {
      this._client.on(event, callback);
    }
    
  }

  close() {
    this._client.close();
  }

}

module.exports = WebSocketUser;
