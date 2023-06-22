const { Router } = require("express");
const {
  getAllNotes,
  postNotes,
  deleteNotes,
  editNote,
} = require("../controler/notesC.js");

const router = Router();

router.post("/", getAllNotes);
router.post("/:idUser", postNotes);
router.delete("/:idNote", deleteNotes);
router.patch("/:idNote", editNote);

module.exports = router;
