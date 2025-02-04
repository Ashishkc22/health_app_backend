const router = require("express").Router();

const { authHandler } = require("../middlewares");
// const authHandler = (req, res, next) => {
//   next();
// };
router.use("/auth", require("./Auth"));
router.use("/user", authHandler, require("./User"));
router.use("/payment", authHandler, require("./Payment"));
router.use("/cards", authHandler, require("./Cards"));
router.use("/hospitals", authHandler, require("./Hospitals"));
router.use("/settings", authHandler, require("./Settings"));
router.use("/address", authHandler, require("./Address"));
router.use("/dashboard", authHandler, require("./Dashboard"));
router.use("/bin", authHandler, require("./Bin"));
router.use("/ping", (req, res) => res.send("pong"));
router.use("/plans", authHandler, require("./Plans"));
router.use("/download-app", require("./downloadApp"));

// Route not found middleware
router.use((req, res, next) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

module.exports = router;
