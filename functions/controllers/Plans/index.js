const router = require("express").Router();

router.get("/get-plans", require("./get-plans"));
router.get("/get-my-plan", require("./get-my-plan"));

module.exports = router;
