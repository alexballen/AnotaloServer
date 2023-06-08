const { Router } = require("express");
const {
  getAllUser,
  postSignUp,
  postSignIn,
  postSendMail,
  getSingInGoogle,
  getAccessTokenGoogle,
} = require("../controler/userC.js");

const router = Router();

router.get("/user", getAllUser);
router.get("/auth/google", getSingInGoogle);
router.get("/auth/google/callback", getAccessTokenGoogle);
router.post("/signup", postSignUp);
router.post("/signin", postSignIn);
router.post("/email", postSendMail);

module.exports = router;
