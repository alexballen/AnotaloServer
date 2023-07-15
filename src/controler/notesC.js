const { Notes, User } = require("../db.js");

const getAllNotes = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      throw new Error("No se encontró el email");
    }
    const allNotes = await User.findOne({
      where: { email },
      include: {
        model: Notes,
      },
    });

    res.status(200).json(allNotes.notes);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Ha ocurrido un error en getAllNotes",
      error: error.message,
    });
  }
};

const postNotes = async (req, res) => {
  const { title, description, importance, reminder } = req.body;
  const { userId } = req.params;
  console.log(reminder);

  try {
    const exitsUser = await User.findByPk(userId);

    if (!exitsUser) {
      throw new Error("No se encontró el usuario");
    }
    const newNote = await Notes.create({
      title,
      description,
      importance,
      reminder,
    });

    await exitsUser.addNotes(newNote);

    res.status(200).json(newNote);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Ha ocurrido un error en postNotes",
      error: error.message,
    });
  }
};

const deleteNotes = async (req, res) => {
  const { noteId } = req.params;

  try {
    const searchIdNote = await Notes.findOne({
      where: { id: noteId },
    });

    if (searchIdNote === null) {
      throw new Error("La nota no existe en la base de datos");
    }

    await Notes.destroy({
      where: { id: noteId },
    });

    res.status(200).json({
      message: "Se eliminó la nota exitosamente",
      data: searchIdNote,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Ha ocurrido un error en deleteNotes",
      error: error.message,
    });
  }
};

const editNote = async (req, res) => {
  const { noteId } = req.params;
  const { title, description, importance, reminder } = req.body;
  console.log(reminder);

  try {
    const searchIdNote = await Notes.findOne({
      where: { id: noteId },
    });
    if (searchIdNote === null) {
      throw new Error("La nota no existe en la base de datos");
    }

    if (
      importance !== "high" &&
      importance !== "medium" &&
      importance !== "low"
    ) {
      throw new Error(
        "La nota debe tener un esatdo de importancia high, medium o low"
      );
    }

    await Notes.update(
      { title, description, importance, reminder },
      { where: { id: noteId } }
    );

    const searchIdNoteUpdate = await Notes.findOne({
      where: { id: noteId },
    });

    res.status(200).json({
      message: "Se actualizo la nota exitosamente",
      data: searchIdNoteUpdate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Ha ocurrido un error en editNote",
      error: error.message,
    });
  }
};

module.exports = {
  getAllNotes,
  postNotes,
  deleteNotes,
  editNote,
};
