const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Function to get the local IP address
function getLocalIP() {
  const os = require("os");
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

// Create HTTP Server (Fixes the issue)
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Change this to LAN IP when needed
    methods: ["GET", "POST"],
  },
});

let dataInterval = null;
let connectedUsers = 0;

io.on("connection", (socket) => {
  connectedUsers++;
  console.log(`✅ User connected: ${socket.id} | Active users: ${connectedUsers}`);

  socket.emit("welcome", { message: "Connected to WebSocket server" });

  if (connectedUsers === 1) {
    startDataEmission();
  }

  socket.on("disconnect", () => {
    connectedUsers--;
    console.log(`❌ User disconnected: ${socket.id} | Active users: ${connectedUsers}`);

    if (connectedUsers === 0) {
      stopDataEmission();
    }
  });

  socket.on("connect_error", (err) => {
    console.error("⚠️ WebSocket connection error:", err.message);
  });
});

const startDataEmission = () => {
  if (!dataInterval) {
    console.log("📡 Starting data emission...");
    dataInterval = setInterval(() => {
      const voltageData = Math.random() * (240 - 180) + 180;
      const currentData = Math.random() * (20 - 5) + 5;
      const temperatureData = Math.random() * (80 - 30) + 30;

      console.log("📊 Emitting data:", { voltage: voltageData, current: currentData, temperature: temperatureData });
      io.emit("graphData", { voltage: voltageData, current: currentData, temperature: temperatureData });
    }, 1000);
  }
};

const stopDataEmission = () => {
  if (dataInterval) {
    clearInterval(dataInterval);
    dataInterval = null;
    console.log("🛑 Stopped data emission (No active users)");
  }
};

// Gracefully shutdown server
const shutdownServer = () => {
  console.log("\n🛑 Shutting down server...");

  io.close(() => console.log("✅ WebSocket server closed."));
  stopDataEmission();
  server.close(() => {
    console.log("✅ HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdownServer);
process.on("SIGTERM", shutdownServer);

// ✅ Start server **AFTER** defining `server`
const HOST = "0.0.0.0"; // Allows LAN access
server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${getLocalIP()}:${PORT}`);
});

// taskkill /IM node.exe /F (to kill the process in the server)