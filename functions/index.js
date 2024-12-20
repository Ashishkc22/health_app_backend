require("dotenv").config();
const express = require("express");
const functions = require("firebase-functions");
// const fs = require("fs");
const cors = require("cors")({ origin: true });
const cron = require("node-cron");
const app = express();
const { BaseError } = require("./utils/custom-errors");
const { logger } = require("./utils/logger");
const PORT = process.env.PORT || 6060;
process.env.TZ = "Asia/Calcutta";
const mongoose = require("mongoose");
//aarogyam7r
//XGPbiYAWIqHvzsQl
//arogyam-clustor
mongoose.connect(
  // "mongodb+srv://aarogyam7r:XGPbiYAWIqHvzsQl@arogyam-clustor.jqc6cqy.mongodb.net/?retryWrites=true&w=majority",
  "mongodb+srv://Ashish224:AshishKc225@ticketsys.b27zde6.mongodb.net/health-upwork-dev?retryWrites=true&w=majority&appName=TicketSys",
  { useNewUrlParser: true }
);
// mongoose.connect("mongodb+srv://lokeshpilani2010:Scanner1212@cluster0.yyqwqch.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true });
// mongoose.set({ strictQuery: true });
const db = mongoose.connection;
db.on("error", (err) => {
  logger.error(`Failed to connnect DB.`);
  process.exit(1);
});
db.once("open", async function () {
  logger.info(`connected to database`);
});
app.use(express.json({ limit: "10mb" }));
app.use(cors);

const loginRouter = require("./apis/login");
const cardRouter = require("./apis/cards");
const hospitalRouter = require("./apis/hospitals");
const settingRouter = require("./apis/settings");
const addressRouter = require("./apis/address");
const dashboardRouter = require("./apis/dashboard");
const updateUserStatus = require("./crons/updateUserStatus");
const cleanbin = require("./crons/cleanBin");

// Schedule the cron job to run every day at 11:00 PM
cron.schedule(
  "0 23 * * *",
  () => {
    updateUserStatus.updateUserStatus();
    cleanbin.deleteDocumentsThreeDaysAgo();
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata", // Set your timezone
  }
);

app.use(require("./controllers"));
// app.use("/auth", loginRouter);
// app.use("/cards", cardRouter);
// app.use("/hospitals", hospitalRouter);
// app.use("/settings", settingRouter);
// app.use("/address", addressRouter);
// app.use("/dashboard", dashboardRouter);
// app.use("/bin", require("./apis/bin"));
// app.get("/", (req, res) => res.send("Express on Vercel"));
// app.get("/test", (req, res) => res.send("TEST Express on Vercel"));

// HTTP Error Handling
app.use(require("./middlewares/ErrorHandler"));
// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  if (error instanceof BaseError) {
    logger.error(err.description);
  } else {
    logger.crit("Uncaught exception.");
    // process.exit(1);
  }
});

// APP Listing
app.listen(PORT, async () => {
  logger.info(`Listening on port ${PORT}`);
});

// exports.app = functions
//   .runWith({ memory: "512MB" })
//   .region("asia-south1")
//   .https.onRequest(app);

// exports.app = functions.https.onRequest(app);
