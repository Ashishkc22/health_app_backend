const router = require("express").Router();

router.delete("/card", require("./delete-card-by-id"));
router.delete("/hospital", require("./delete-hospital-by-id"));
router.get("/", require("./get-bin-data"));
router.post("/restore", require("./restore-bin-data"));

module.exports = router;
