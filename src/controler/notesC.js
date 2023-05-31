const { Notes } = require("../db.js");

const getAllNotes = async (req, res) => {
  try {
    const allNotes = await Notes.findAll();
    res.status(200).json(allNotes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Ha ocurrido un error getAllNotes" });
  }
};

const postNotes = async (req, res) => {
  const { name, description, importance } = req.body;
  console.log(name, description, importance);
  try {
    const newNote = await Notes.create({
      name,
      description,
      importance,
    });
    res.status(200).json(newNote);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Ha ocurrido un error postNotes" });
  }
};

module.exports = {
  getAllNotes,
  postNotes,
};
