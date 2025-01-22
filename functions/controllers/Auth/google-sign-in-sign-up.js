const router = require("express").Router();
const passport = require("passport");
const { getUser, getUsersRoleAndServiceDetails } = require("../../processors");
const { set } = require("../../config.js/cache.config");
const { token } = require("../../utils/token");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    // failureRedirect: "/auth/failed",
    // successRedirect: "/auth/success",
    session: false,
  }),
  async function (req, res) {
    try {
      const user = await getUser({ email: req.user.email });

      // get role and services detais
      const userRoleAndServiceDetails = await getUsersRoleAndServiceDetails({
        userId: user.id,
      });
      set(user.id, userRoleAndServiceDetails, 60 * 60 * 24);
      const genratedToken = await token.signToken({
        payload: {
          id: user.id,
          status: user.status,
          email: user.email,
          uid: user.uid,
          role: user.role,
          name: user.name,
        },
      });
      return res.redirect(
        `http://localhost:5173/dashboard?token=${genratedToken}`
      );
    } catch (error) {
      return res.redirect("http://localhost:5173/google-sign-in-error");
    }
  }
);

router.get("/failed", (req, res) => {
  console.log("Google sign in failed");
  res.redirect("http://localhost:5173");
});
router.get("/success", (req, res) => {
  console.log("Google sign in success");
  res.redirect("http://localhost:5173");
});

module.exports = router;
