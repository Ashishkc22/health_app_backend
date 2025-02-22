const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const router = express.Router();
const uploadDir = path.join(__dirname, "../", "uploads/videos");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed file types
const allowedMimeTypes = ["video/mp4", "video/webm", "video/ogg"];

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_"); // Remove special characters
    cb(null, `${Date.now()}-${safeFilename}`);
  },
});

// File filter to validate mime type
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only MP4, WEBM, and OGG are allowed."));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter,
});

// Rate Limiting (to prevent abuse)
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 uploads per windowMs
  message: "Too many uploads from this IP, please try again later.",
});

// CORS configuration
// router.use(cors({
//   origin: process.env.ALLOWED_ORIGINS || "*",
//   methods: ["GET", "POST", "DELETE"],
// }));

// Upload Video
router.post(
  "/upload-video",
  uploadLimiter,
  upload.single("video"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.status(201).json({
      message: "Video uploaded successfully",
      filename: req.file.filename,
      url: `/uploads/videos/${req.file.filename}`,
    });
  }
);

// Get All Videos
router.get("/get-videos", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Unable to retrieve videos" });
    }
    const videos = files.map((file) => ({
      filename: file,
      url: `/uploads/videos/${file}`,
    }));
    res.status(200).json({ videos });
  });
});

// Delete Video
router.delete("/delete-video", (req, res) => {
  const filename = req.query.filename;
  if (!filename) {
    return res.status(400).json({ error: "Filename is required" });
  }

  const filePath = path.join(uploadDir, path.basename(filename)); // Prevent path traversal attacks

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to delete video" });
    }
    res.status(200).json({ message: "Video deleted successfully" });
  });
});

module.exports = router;
