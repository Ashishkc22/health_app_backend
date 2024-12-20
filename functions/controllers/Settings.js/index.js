const router = require("express").Router();

router.post("/add-setting", require("./add-setting"));
router.get("/get-settings", require("./get-settings"));
module.exports = router;
