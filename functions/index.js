require("dotenv").config();
const express = require("express");
const functions = require("firebase-functions");
// const fs = require("fs");
const cors = require("cors")({ origin: "*" });
const path = require("path");
const app = express();
const { BaseError } = require("./utils/custom-errors");
const { logger } = require("./utils/logger");
const PORT = process.env.PORT || 6060;
process.env.TZ = "Asia/Calcutta";
const mongoose = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
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

// Schedule the cron job to run every day at 11:00 PM
// cron.schedule(
//   "0 23 * * *",
//   () => {
//     updateUserStatus.updateUserStatus();
//     cleanbin.deleteDocumentsThreeDaysAgo();
//   },
//   {
//     scheduled: true,
//     timezone: "Asia/Kolkata", // Set your timezone
//   }
// );

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

console.log("GOOGLE_CLIENT_ID", GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET", GOOGLE_CLIENT_SECRET);

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.DEPLOYED_URL}/auth/google/callback`,
    },
    require("./controllers/Auth/handle-google-user")
  )
);
// // Save the session to the cookie
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Read the session from the cookie
passport.deserializeUser((id, done) => {
  // User.findById(id).then(user => {
  //   done(null, user);
  // });
  done(null, id);
});

app.use(passport.initialize());
// serve gallery images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(require("./controllers"));

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
if (Process.env.ENV === "production" || Process.env.ENV === "staging") {
  exports.app = functions
    .runWith({ memory: "512MB" })
    .region("asia-south1")
    .https.onRequest(app);
} else {
  app.listen(PORT, async () => {
    logger.info(`Listening on port ${PORT}`);
  });
}

// exports.app = functions.https.onRequest(app);
