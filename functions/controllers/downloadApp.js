const path = require("path");
const fs = require("fs");
const downloadApp = async (req, res,next) => {
  try {
    const version = req.query.version;
    if (!version) {
      return res.status(400).json({ error: "Version is required" });
    }
    const filePath = path.join(__dirname, `../../apk/${version}.apk`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Version not found" });
    }
    res.setHeader("Content-disposition", `attachment; filename=${version}.apk`);
    res.setHeader("Content-type", "application/vnd.android.package-archive");
    return res.sendFile(filePath);
  } catch (error) {
    console.log("Error downloading APK", error);
    next(error)
  }
};

module.exports = downloadApp;
