# node-ws

> **Beware:** Experimental technology ahead!


### What is this?
Simply, it is a WebSocket server created in node using `express` and `ws`
modules.


### How different is this from a WebSocket server?
A WebSocket server sends a message that it receives to all of it's connected
clients, a thing that we don't want sometimes.

So, we add users into specific rooms and restrict the communication within a
room.


### What is a room?
A room is a virtual place to which users get added(actually join) based on the
room's limit. So, every message you send is only received by users in the same
room that you are in.


### How do I use this?
* Clone the project
* Go to the folder and run `npm install` to install the dependencies
* Run `npm start` to start the WebSocket server
* Go to `http://localhost:8000` to check if it works

> __Note:__ node-ws uses only JSON to move message back and forth. If the
message is not in JSON, then it gets dumped.


#### Users in a room!
The number of users in a room can be controlled by changing `ROOM_LIMIT`(>=2)
in `index.js`.


#### Usage in the browser!
When a new connection is made to the WebSocket server, the first thing to do
after the connection is opened, is to send a join request followed by the name
of room you wish to join.

```javascript
let ws = new WebSocket('ws://localhost:8000');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'join',
    room: 'my-private-room'
  }));
};
```

#### The JSON object!

```javascript
{
  type: 'join | leave | msg | notif',
  room: 'my-private-room',
  body: 'A private message'
}
```

__When sending requests:__

* `type`: _Type of request/response._

  Valid strings: `'join' | 'leave' | 'msg'`

  `'join'` - A join request, used along with 'room'  
  `'leave'` - Request to leave the room(WebSocket connection is not closed)  
  `'msg'` - Just send the messages to other users

* `room`: _Name of room to join_

  Used along with `type: 'join'` only

__When receiving responses:__

* `type`: _Type of response message_

  Valid responses: `'msg' | 'notif'`

  `'msg'` - Specifying a message is received  
  `'notif'` - Notification from server(like when users leave room)

* `body`: _Includes message content_


---

> __Note:__ This is just some experimental technology that may not be of any
use for you. _Use with caution!_


### License
Author: [ramlmn](https://github.com/ramlmn/)

License: [Apache-2.0](LICENSE)
