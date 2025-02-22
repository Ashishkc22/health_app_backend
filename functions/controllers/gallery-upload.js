const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const router = require("express").Router();

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Invalid file type. Only images are allowed."),
        false
      );
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Upload an image
router.post("/gallery-upload", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res
      .status(200)
      .json({ message: "File uploaded successfully", file: req.file.filename });
  });
});

// Delete an image
router.delete("/delete", (req, res) => {
  const filePath = path.join(
    __dirname,
    "../",
    "uploads",
    path.basename(req.query.filename)
  );

  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).json({ message: "Error deleting file" });
      }
      res.status(200).json({ message: "File deleted successfully" });
    });
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

// Get all images
router.get("/get-images", (req, res) => {
  const uploadDir = path.join(__dirname, "../", "uploads/");
  if (!fs.existsSync(uploadDir)) {
    return res.status(200).json({ images: [] });
  }

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Error reading directory" });
    }

    const baseUrl = `/uploads/`;

    res.status(200).json({
      images: files
        .filter((file) => /^[a-f0-9\-]+\.[a-z]+$/.test(file))
        .map((file) => ({
          filename: file,
          url: `${baseUrl}${file}`,
        })),
    });
  });
});

module.exports = router;
