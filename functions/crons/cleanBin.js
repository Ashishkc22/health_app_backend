const { default: mongoose } = require("mongoose");
const bin = require("../models/bin");
async function deleteDocumentsThreeDaysAgo() {
  try {
    const now = new Date();
    const threeDaysAgo = new Date(now.setDate(now.getDate() - 3));
    const startOfDayThreeDaysAgo = new Date(threeDaysAgo.setHours(0, 0, 0, 0));
    const endOfDayThreeDaysAgo = new Date(
      threeDaysAgo.setHours(23, 59, 59, 999)
    );

    const result = await bin.deleteMany({
      deleted_at: {
        $gte: startOfDayThreeDaysAgo,
        $lte: endOfDayThreeDaysAgo,
      },
    });

    console.log(`Deleted ${result.deletedCount} documents.`);
  } finally {
  }
}

module.exports = {
  deleteDocumentsThreeDaysAgo,
};
