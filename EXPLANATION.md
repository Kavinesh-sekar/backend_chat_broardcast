WebSocket Server Explanation

Overview

This document explains the thought process and implementation details of the WebSocket server. The server enables real-time communication between multiple clients using WebSockets, making it ideal for chat applications, live notifications, and real-time updates.

Server Setup and Connection Handling

1. Initializing the Server
           The WebSocket server is created using Express.js and the ws library. It listens for incoming client connections and handles messages.
           
        const WebSocket = require("ws");
        const http = require("http");
        
        const app = express();
        const server = http.createServer(app);
        const wsServer = new WebSocket.Server({ server });

2. Client Connection Handling
        When a client connects, the server logs the connection.
    
      wsServer.on("connection", (ws) => {
        console.log("New user connected");
      });
    
    The wsServer.on("connection") event fires when a new client joins.
    
    Each client is assigned a WebSocket instance for communication.


3. Message Handling and Broadcasting
    When a client sends a message, the server reads and processes it.
      
      ws.on("message", (message) => {
        const data = JSON.parse(message);
        console.log("Received message:", data);
      
        if (data.type === "register") {
          broadcastMessage({ type: "system", content: `${data.userName} joined` });
        } else if (data.type === "message") {
          broadcastMessage({ type: "message", content: data.content, userName: data.userName });
        }
      });
      
      If the message is of type register, the server announces the new user.
      
      If it's a chat message, it is broadcasted to all clients.


4)  Broadcasting Messages

      The server sends messages to all connected clients using:
      
      function broadcastMessage(data) {
        wsServer.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      }
      
      The function loops through all connected clients.
      
      If the client is active, the message is sent.


5) Handling Disconnection

    When a client disconnects, the server removes them from the active user list and notifies others:
    
    ws.on("close", () => {
      console.log("User disconnected");
    });
    
    The "close" event triggers when a client disconnects.
    
    The server can update the user list and inform other clients.


