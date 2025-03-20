const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let dataInterval = null; // Store interval globally
let connectedUsers = 0; // Track active users

io.on("connection", (socket) => {
  connectedUsers++;
  console.log(`✅ User connected: ${socket.id} | Active users: ${connectedUsers}`);

  // Emit a welcome event to confirm connection
  socket.emit("welcome", { message: "Connected to WebSocket server" });

  // Start sending data only if it's the first connection
  if (connectedUsers === 1) {
    startDataEmission();
  }

  // Handle disconnection
  socket.on("disconnect", () => {
    connectedUsers--;
    console.log(`❌ User disconnected: ${socket.id} | Active users: ${connectedUsers}`);

    // Stop data emission if no users are connected
    if (connectedUsers === 0) {
      stopDataEmission();
    }
  });

  // Listen for WebSocket errors
  socket.on("connect_error", (err) => {
    console.error("⚠️ WebSocket connection error:", err.message);
  });
});

// Start interval if not already running
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

// Stop interval when no users are connected
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
  stopDataEmission(); // Ensure interval stops
  server.close(() => {
    console.log("✅ HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdownServer);
process.on("SIGTERM", shutdownServer);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


// taskkill /IM node.exe /F (to kill the process in the server)