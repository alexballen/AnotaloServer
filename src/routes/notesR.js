const { Router } = require("express");
const {
  getAllNotes,
  postNotes,
  deleteNotes,
  editNote,
} = require("../controler/notesC.js");

const router = Router();

router.post("/", getAllNotes);
router.post("/:userId", postNotes);
router.delete("/:noteId", deleteNotes);
router.patch("/:noteId", editNote);

module.exports = router;
