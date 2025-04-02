const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");
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

// Create HTTP Server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Change this to LAN IP when needed
    methods: ["GET", "POST"],
  },
});

let dataInterval = null;
let connectedUsers = 0;
let csvData = [];
let currentIndex = 0;

// Load CSV data
const loadCSVData = () => {
  csvData = [];
  fs.createReadStream("faultdata.csv")
    .pipe(csv())
    .on("data", (row) => {
      csvData.push({
        timestamp: row.Timestamp,
        voltage: parseFloat(row["Voltage (V)"]),
        current: parseFloat(row["Current (A)"]),
        temperature: parseFloat(row["Temperature (degree Celsius)"]),
      });
    })
    .on("end", () => {
      console.log("✅ CSV data loaded successfully.");
    })
    .on("error", (err) => {
      console.error("❌ Error reading CSV file:", err.message);
    });
};

loadCSVData();

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
  if (!dataInterval && csvData.length > 0) {
    console.log("📡 Starting data emission...");
    currentIndex = 0; // Reset index
    dataInterval = setInterval(() => {
      if (currentIndex < csvData.length) {
        const data = csvData[currentIndex];
        console.log("📊 Emitting data:", data);
        io.emit("graphData", data);
        currentIndex++;
      } else {
        console.log("✅ All data emitted. Restarting from the beginning.");
        currentIndex = 0; // Restart from the beginning
      }
    }, 3000); // 5-second interval
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