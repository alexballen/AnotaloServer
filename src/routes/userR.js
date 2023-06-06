const { Router } = require("express");
const {
  getAllUser,
  postSignUp,
  postSignIn,
  postSendMail,
  getSingInGoogle,
  getCodeAuthGoogle,
  getErrorAuthGoogle,
} = require("../controler/userC.js");

const router = Router();

router.get("/user", getAllUser);
router.get("/auth/google", getSingInGoogle);
router.get("/auth/google/callback", getCodeAuthGoogle);
router.get("/auth/error/v2", getErrorAuthGoogle);
router.post("/signup", postSignUp);
router.post("/signin", postSignIn);
router.post("/email", postSendMail);

module.exports = router;
