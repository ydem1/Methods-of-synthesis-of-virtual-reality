const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sensorOrient = { qx: 0, qy: 0, qz: 0, qw: 1 };
const rawQueue = [];
const playbackQueue = [];

app.post("/sensor", (req, res) => {
  try {
    if (!req.body.payload) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const orientationData = req.body.payload.find(
      item => item.name === 'orientation' && item.values
    );

    if (orientationData) {
      const { qx, qy, qz, qw } = orientationData.values;
      
      if ([qx, qy, qz, qw].every(val => val !== undefined)) {
        rawQueue.push({ qx, qy, qz, qw });
        console.log("Added orientation data:", { qx, qy, qz, qw });
      }
    }

    res.status(200).json({ status: "OK" });
  } catch (e) {
    console.error("Error processing request:", e);
    res.status(500).json({ error: e.message });
  }
});

wss.on("connection", (ws) => {
  console.log("New client connected");

  const sendUpdate = () => {
    ws.send(
      JSON.stringify({
        payload: [
          {
            values: sensorOrient,
            timestamp: Date.now(),
          },
        ],
      })
    );
  };

  const interval = setInterval(sendUpdate, 20);
  ws.on("close", () => clearInterval(interval));
});

setInterval(() => {
  const N = rawQueue.length;
  if (N === 0) return;

  const desired = 60;
  const step = N / desired;
  for (let i = 0; i < desired; i++) {
    const idx = Math.min(Math.floor(i * step), N - 1);
    playbackQueue.push(rawQueue[idx]);
  }
  rawQueue.length = 0;
}, 1000);

setInterval(() => {
  if (playbackQueue.length === 0) return;
  const q = playbackQueue.shift();
  Object.assign(sensorOrient, q);
}, 16);

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
