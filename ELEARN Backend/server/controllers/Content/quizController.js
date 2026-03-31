import { getDb } from "../../mongo.js";
import { ObjectId } from "mongodb";
import { Response } from "../../models/Response.js";
import mongoose from "mongoose";

// Create quiz for a lesson
export const createQuiz = async (req, res) => {
  const { lessonId } = req.params;
  const { title, description } = req.body;

  try {
    const quizzes = getDb().collection("quizzes");
    const result = await quizzes.insertOne({ 
      lesson_id: new ObjectId(lessonId),
      title,
      description,
      created_by: req.user.id });
    res.json({ message: "Quiz created successfully", id: result.insertedId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create general quiz (linked to a video with link or structured questions)
export const createGeneralQuiz = async (req, res) => {
  const { title, course_id, year_id, subject_id, after_video_id, quiz_link, questions } = req.body;

  try {
    let fileUrl = null;
    if (req.file) {
      const { getBucket } = await import("../../mongo.js");
      const bucket = getBucket();
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: { 
          courseId: course_id, 
          subjectId: subject_id,
          type: "quiz" 
        }
      });
      uploadStream.end(req.file.buffer);
      fileUrl = `/files/${uploadStream.id}`;
    }

    // Process questions if they are a string (from FormData)
    let parsedQuestions = null;
    if (questions) {
      try {
        parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
      } catch (e) {
        console.error('Error parsing questions:', e);
      }
    }

    const quizzes = getDb().collection("quizzes");
    const result = await quizzes.insertOne({
      title,
      course_id: new ObjectId(course_id),
      year_id,
      subject_id: new ObjectId(subject_id),
      after_video_id: new ObjectId(after_video_id),
      file_url: fileUrl,
      quiz_link: quiz_link || null,
      questions: parsedQuestions || null,
      created_by: req.user.id,
      createdAt: new Date()
    });

    res.json({ 
      message: "Quiz created successfully", 
      id: result.insertedId,
      title,
      quiz_link,
      questions: parsedQuestions
    });
  } catch (err) {
    console.error('General quiz creation error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add question to quiz
export const addQuestion = async (req, res) => {
  const { quizId } = req.params;
  const { question_text, type } = req.body;

  try {
    // Validate type
    const allowedTypes = ["mcq", "true_false", "multiple_select", "short_answer", "fill_blank"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid question type" });
    }

    const questions = getDb().collection("questions");
    const result = await questions.insertOne({
      quiz_id: new ObjectId(quizId),
      question_text,
      type,
      createdAt: new Date()
    });

    res.json({ message: "Question added successfully", id: result.insertedId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add option to question
export const addOption = async (req, res) => {
  const { questionId } = req.params;
  const { text, isCorrect } = req.body;

  try {
    const questions = getDb().collection("questions");
    const options = getDb().collection("options");

    const question = await questions.findOne({ _id: new ObjectId(questionId) });
    if (!question) return res.status(404).json({ error: "Question not found" });

    // Enforce rules based on type
    if (question.type === "true_false") {
      const existingOptions = await options.countDocuments({ question_id: question._id });
      if (existingOptions >= 2) {
        return res.status(400).json({ error: "True/False questions can only have 2 options" });
      }
    }

    if (question.type === "mcq") {
      if (isCorrect) {
        const existingCorrect = await options.findOne({ question_id: question._id, isCorrect: true });
        if (existingCorrect) {
          return res.status(400).json({ error: "MCQ can only have one correct option" });
        }
      }
    }

    const result = await options.insertOne({
      question_id: question._id,
      text,
      isCorrect: !!isCorrect,
      createdAt: new Date()
    });

    res.json({ message: "Option added successfully", id: result.insertedId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getQuiz = async (req, res) => {
  const { lessonId } = req.params;

  try {
    const lessons = getDb().collection("content");
    const lesson = await lessons.findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    // Check enrollment
    const enrollments = getDb().collection("enrollment");
    const enrollment = await enrollments.findOne({
      course_id: lesson.course_id,
      student_id: new ObjectId(req.user.id),
      status: "accepted"
    });
    if (!enrollment) {
      return res.status(403).json({ error: "You are not enrolled in this course" });
    }

    // Get quiz
    const quizzes = getDb().collection("quizzes");
    const quiz = await quizzes.findOne({ lesson_id: new ObjectId(lessonId) });
    if (!quiz) {
      return res.status(404).json({ error: "No quiz found for this lesson" });
    }

    // Populate questions + options
    const questionsCol = getDb().collection("questions");
    const optionsCol = getDb().collection("options");

    const questions = await questionsCol.aggregate([
      { $match: { quiz_id: quiz._id } },
      {
        $lookup: {
          from: "options",
          localField: "_id",
          foreignField: "question_id",
          as: "options"
        }
      }
    ]).toArray();

    quiz.questions = questions;

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit student response
export const submitResponse = async (req, res) => {
  const { questionId } = req.params;
  const { selected_option_id } = req.body;
  const student_id = req.user.id;
  try {
    const responses = getDb().collection("responses");
      const result = await responses.insertOne({
      student_id: new ObjectId(student_id),
      question_id: new ObjectId(questionId),
      selected_option_id: new ObjectId(selected_option_id),
      submitted_at: new Date()
    });
    res.json({ message: "Response submitted successfully", id: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get quiz results for a student
export const getQuizResults = async (req, res) => {
  const { quizId } = req.params;
  const student_id = req.user.id;

  try {
    const questions = getDb().collection("questions");
    const options = getDb().collection("options");
    const responses = getDb().collection("responses");

    const quizQuestions = await questions.find({ quiz_id: new ObjectId(quizId) }).toArray();

    let score = 0;
    const results = [];

    for (const q of quizQuestions) {
      const response = await responses.findOne({
        student_id: new ObjectId(student_id),
        question_id: q._id
      });

      if (response) {
        const selectedOption = await options.findOne({ _id: response.selectedOption_id });
        const correctOption = await options.findOne({ question_id: q._id, isCorrect: true });

        if (selectedOption?.isCorrect) score++;

        results.push({
          question: q.text,
          selected: selectedOption?.text,
          correct: correctOption?.text,
          isCorrect: selectedOption?.isCorrect || false
        });
      }
    }

    res.json({ score, total: quizQuestions.length, details: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get quizzes for a specific subject
export const getQuizzesBySubject = async (req, res) => {
  const { subjectId } = req.params;
  try {
    const quizzes = getDb().collection("quizzes");
    const results = await quizzes.find({ subject_id: new ObjectId(subjectId) }).toArray();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific quiz by ID
export const getQuizById = async (req, res) => {
  const { quizId } = req.params;
  try {
    const quizzes = getDb().collection("quizzes");
    const quiz = await quizzes.findOne({ _id: new ObjectId(quizId) });
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit a full quiz result at once (New system for statistics)
export const submitFullQuiz = async (req, res) => {
  const { quizId } = req.params;
  const { answers, score } = req.body;
  const student_id = req.user.id;

  try {
    const newResponse = new Response({
      student_id,
      quiz_id: quizId,
      answers: (answers || []).map(a => ({
        question_id: a.question_id,
        option_id: a.option_id
      })),
      score: score || 0
    });

    await newResponse.save();
    res.json({ message: "Quiz result recorded successfully", responseId: newResponse._id });
  } catch (err) {
    console.error('Submit full quiz error:', err);
    res.status(500).json({ error: err.message });
  }
};
