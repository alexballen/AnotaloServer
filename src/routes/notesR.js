const { Router } = require("express");
const { getAllNotes, postNotes } = require("../controler/notesC.js");

const router = Router();

router.get("/", getAllNotes);
router.post("/", postNotes);

module.exports = router;
