import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  console.log("Recibida solicitud a /");
  res.send("Backend funcionando");
});

let isShuttingDown = false;

const server = app.listen(port, () => {
  console.log(`✅ Server started on port ${port}`);
  console.log(`📍 http://localhost:${port}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});

process.on("SIGINT", () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log("\nClosing server...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
  
  // Forcefully exit after 5 seconds
  setTimeout(() => {
    console.log("Forcing shutdown...");
    process.exit(1);
  }, 5000);
});
