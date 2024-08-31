// require('dotenv').config();
const express = require("express");
const functions = require("firebase-functions");
// const fs = require("fs");
const cors = require("cors")({ origin: true });
const cron = require("node-cron");
const app = express();

process.env.TZ = "Asia/Calcutta";
const mongoose = require("mongoose");
//aarogyam7r
//XGPbiYAWIqHvzsQl
//arogyam-clustor
mongoose.connect(
  "mongodb+srv://aarogyam7r:XGPbiYAWIqHvzsQl@arogyam-clustor.jqc6cqy.mongodb.net/?retryWrites=true&w=majority",
  //   "mongodb+srv://Ashish224:AshishKc225@ticketsys.b27zde6.mongodb.net/yourDatabaseName?retryWrites=true&w=majority&appName=TicketSys",
  { useNewUrlParser: true }
);
// mongoose.connect("mongodb+srv://lokeshpilani2010:Scanner1212@cluster0.yyqwqch.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true });
// mongoose.set({ strictQuery: true });
const db = mongoose.connection;
db.on("error", (err) => {
  console.error(err);
});

const cardSch = require("./models/card");
// const userSch = require('./models/user');
db.once("open", async function () {
  console.log("connected to database");
  // await cardSch.updateMany({
  //     status: "DELIVERED"
  // }, { status: "SUBMITTED" });
  // await userSch({
  //     name: "Lokesh",
  //     password: "Lokesh@1234",
  //     phone: "9887999888",
  //     email: "lokeshpilani2010@gmail.com",
  //     device_id: "1212",
  //     status: "Verified",
  // }).save();
  // console.log(await userSch.find());
  // await cardSch.create({
  //     email: '7rogyam@gmail.com',
  //     password: 'Aa@123456',
  //     name: 'Aarogyam Admin',
  //     device_id: 'ADMIN',
  //     role: 'ADMIN',
  //     status: 'Verified',
  //     uid: "FE00000",
  //     phone: "9999999999",
  // });
  // const usrs = await userSch.find();
  // for (let x of usrs) {
  //     console.log(x.uid);
  //     const submitted = await cardSch.count({
  //         created_by: x._id,
  //     });
  //     const p2 = await cardSch.count({
  //         created_by: x._id,
  //         status: 'SUBMITTED'
  //     });
  //     const p = await cardSch.count({
  //         created_by: x._id,
  //         status: 'PRINTED'
  //     });
  //     const delivered = await cardSch.count({
  //         created_by: x._id,
  //         status: 'DELIVERED'
  //     });
  //     const undelivered = await cardSch.count({
  //         created_by: x._id,
  //         status: 'UNDELIVERED'
  //     });
  //     const dis = await cardSch.count({
  //         created_by: x._id,
  //         status: 'DISCARDED'
  //     });
  //     await userSch.findByIdAndUpdate(x._id, {
  //         score: submitted,
  //         p2_count: p2,
  //         p_count: p,
  //         d_count: delivered,
  //         ud_count: undelivered,
  //         dis_count: dis
  //     });
  // }
});

// const expressIp = require("express-ip");
app.use(express.json());
app.use(cors);
// app.use(expressIp().getIp);

const loginRouter = require("./apis/login");
const cardRouter = require("./apis/cards");
const hospitalRouter = require("./apis/hospitals");
const settingRouter = require("./apis/settings");
const addressRouter = require("./apis/address");
const dashboardRouter = require("./apis/dashboard");
const updateUserStatus = require("./crons/updateUserStatus");
const cleanbin = require("./crons/cleanBin");

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

app.use("/auth", loginRouter);
app.use("/cards", cardRouter);
app.use("/hospitals", hospitalRouter);
app.use("/settings", settingRouter);
app.use("/address", addressRouter);
app.use("/dashboard", dashboardRouter);
app.use("/bin", require("./apis/bin"));

app.listen(6060, async () => {
  console.log("Listening on post 6060");
});

// exports.app = functions.runWith({ memory: "512MB" }).region("asia-south1").https.onRequest(app);
