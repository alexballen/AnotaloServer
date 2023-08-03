const { Router } = require("express");
const {
  getAllUser,
  postSignUp,
  postSendMail,
  getSingInGoogle,
  getAccessTokenGoogle,
  verificationToken,
  resetPassword,
  passwordResetConfirmation,
  tokenConfirmation,
  deleteUser,
} = require("../controler/userC.js");

const router = Router();

router.get("/user", getAllUser);
router.get("/auth/google", getSingInGoogle);
router.post("/signin", getAccessTokenGoogle);
router.post("/signup", postSignUp);
router.post("/email", postSendMail);
router.post("/verification", verificationToken);
router.post("/resetpassword", resetPassword);
router.post("/passwordresetconfirmation", passwordResetConfirmation);
router.patch("/accountconfirmation", tokenConfirmation);
router.delete("/delete/:userId", deleteUser);

module.exports = router;
