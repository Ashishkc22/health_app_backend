const router = require("express").Router();

router.get("/", require("./get-dashboard-data"));
router.get("/get-my-leaderboard", require("./get-my-leaderboard"));
module.exports = router;
