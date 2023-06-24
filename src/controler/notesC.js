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
  const { name, description, importance } = req.body;
  const { idUser } = req.params;

  try {
    const exitsUser = await User.findByPk(idUser);

    if (!exitsUser) {
      throw new Error("No se encontró el usuario");
    }
    const newNote = await Notes.create({
      name,
      description,
      importance,
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
  const { idNote } = req.params;

  try {
    const searchIdNote = await Notes.findOne({
      where: { id: idNote },
    });

    if (searchIdNote === null) {
      throw new Error("La nota no existe en la base de datos");
    }

    await Notes.destroy({
      where: { id: idNote },
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
  const { idNote } = req.params;
  const { name, description, importance } = req.body;

  try {
    const searchIdNote = await Notes.findOne({
      where: { id: idNote },
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
      { name, description, importance },
      { where: { id: idNote } }
    );

    const searchIdNoteUpdate = await Notes.findOne({
      where: { id: idNote },
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
