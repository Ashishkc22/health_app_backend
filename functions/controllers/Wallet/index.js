const router = require("express").Router();
const getMyWalletDetails  = require("./get-my-wallet-details");

router.get("/get-my-wallet-details", getMyWalletDetails);
module.exports = router;