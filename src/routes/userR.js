const { Router } = require("express");
const {
  getAllUser,
  postSignUp,
  postSendMail,
  getSingInGoogle,
  getAccessTokenGoogle,
  verificationToken,
} = require("../controler/userC.js");

const router = Router();

router.get("/user", getAllUser);
router.get("/auth/google", getSingInGoogle);
router.post("/signin", getAccessTokenGoogle);
router.post("/signup", postSignUp);
router.post("/email", postSendMail);
router.post("/verification", verificationToken);

module.exports = router;
