import { getDb } from "../../mongo.js";
import { ObjectId } from "mongodb";

export const getNoteBySubject = async (req, res) => {
  const { subjectId } = req.params;
  const student_id = req.user.id;

  try {
    const notes = getDb().collection("notes");
    const note = await notes.findOne({ 
      student_id: new ObjectId(student_id), 
      subject_id: new ObjectId(subjectId) 
    });
    res.json(note || { content: "" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const upsertNote = async (req, res) => {
  const { subjectId, content } = req.body;
  const student_id = req.user.id;

  try {
    const notes = getDb().collection("notes");
    const result = await notes.updateOne(
      { 
        student_id: new ObjectId(student_id), 
        subject_id: new ObjectId(subjectId) 
      },
      { 
        $set: { 
          content,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    res.json({ message: "Note saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
