const userSch = require("../models/user");
const cardSch = require("../models/card");
const moment = require("moment");
const updateUserStatus = async () => {
  try {
    // Calculate the date 5 days ago
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5).valueOf();

    // Find users who have submitted cards in the past 5 days
    const usersWithRecentCards = await cardSch.distinct("created_by", {
      created_at: { $gte: fiveDaysAgo },
    });

    // Find users who have not submitted any cards in the past 5 days
    const usersToSuspend = await userSch.find({
      _id: { $nin: usersWithRecentCards },
      role: { $nin: ["ADMIN", "SUBADMIN","USER"] },
      status: "Verified",
    });

    // Update status of these users to "SUSPENDED"
    for (const user of usersToSuspend) {
      await userSch.updateOne(
        { _id: user._id },
        { $set: { status: "Suspended" } }
      );
      console.log(`Updated status to SUSPENDED for user: ${user._id}`);
    }

    console.log("User status update completed.");
  } catch (error) {
    console.error("Error updating user status:", error);
  }
};

module.exports = {
  updateUserStatus,
};
