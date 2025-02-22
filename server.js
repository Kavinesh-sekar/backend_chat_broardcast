const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const http = require("http");

const port = process.env.PORT || 5000;

const app = express();
app.use(cors());

const server = http.createServer(app);
const wsServer = new WebSocket.Server({ server });

const clients = new Map();
const onlineUsers = new Set();

wsServer.on("connection", (ws) => {
  console.log("New user joined");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received message:", data);

      if (data.type === "register") {
        clients.set(ws, { userName: data.userName });
        onlineUsers.add(data.userName); // Add user to the online set

        broadcastMessage({
          type: "system",
          content: `${data.userName} joined the chat`,
        });

        broadcastMessage({
          type: "online-users",
          users: Array.from(onlineUsers), // Send updated online users list
        });

        return;
      }

      if (data.type === "message") {
        const sender = clients.get(ws);

        if (sender) {
          broadcastMessage({
            type: "message",
            content: data.content,
            userName: sender.userName,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.log("Error processing message", err);
    }
  });

  ws.on("close", () => {
    const user = clients.get(ws);
    if (user) {
      clients.delete(ws);
      onlineUsers.delete(user.userName); // Remove user from online set

      broadcastMessage({
        type: "system",
        content: `${user.userName} left the chat`,
      });

      broadcastMessage({
        type: "online-users",
        users: Array.from(onlineUsers), // Send updated online users list
      });
    }
    console.log("Client disconnected");
  });
});

function broadcastMessage(data) {
  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

app.get("/", (req, res) => {
  res.send("Hello world");
});

server.listen(port, () => {
  console.log(`WebSocket server running on port ${port}`);
});
