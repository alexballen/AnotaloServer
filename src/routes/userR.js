const { Router } = require("express");
const {
  getAllUser,
  postSignUp,
  postSignIn,
  postSendMail,
} = require("../controler/userC.js");

const router = Router();

router.get("/user", getAllUser);
router.post("/signup", postSignUp);
router.post("/signin", postSignIn);
router.post("/email", postSendMail);

module.exports = router;
