import express from "express";
import morganMiddleware from "./logger/morgan.logger.js";
import logger from "./logger/winston.logger.js";

const app = express();

// Middleware for parsing JSON
app.use(express.json());

// HTTP logging
app.use(morganMiddleware);

// Routes
app.get("/", (req, res) => {
  logger.info("Home route accessed");
  res.send("Hello from Express with Morgan + Winston!");
});

app.get("/error", (req, res) => {
  try {
    throw new Error("Test error for logging");
  } catch (err) {
    logger.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

export default app;
