const router = require("express").Router();

router.get("/", require("./get-dashboard-data"));
module.exports = router;
