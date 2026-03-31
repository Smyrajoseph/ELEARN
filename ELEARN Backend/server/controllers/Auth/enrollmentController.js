import { getDb } from "../../mongo.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

// Student requests enrollment
export const requestEnrollment = async (req, res) => {
  const { courseId, yearId } = req.body;  // ✅ Now reading from body, not params
  const student_id = req.user.id; // from auth middleware

  try {
    // Validate required fields
    if (!courseId || !yearId) {
      return res.status(400).json({ error: "courseId and yearId are required" });
    }

    const enrollments = getDb().collection("enrollmentrequests");
    const existing = await enrollments.findOne({ 
      student_id: new ObjectId(student_id), 
      course_id: courseId, 
      year_id: yearId 
    });
    
    // If request exists and is pending or accepted, block new request
    if (existing && ["pending", "accepted"].includes(existing.status)) {
      return res.status(400).json({ error: "Request already exists or approved" });
    }
    
    // If request exists and was rejected/unenrolled, we can update it or just delete and insert new.
    if (existing) {
      await enrollments.deleteOne({ _id: existing._id });
    }

    const result = await enrollments.insertOne({
      student_id: new ObjectId(student_id),
      course_id: courseId,
      year_id: yearId,
      status: "pending",
      requestedAt: new Date()
    });

    res.status(201).json({ message: "Enrollment request submitted", id: result.insertedId });
  } catch (err) {
    console.error("Enrollment request error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Teacher/Admin views pending requests for a specific course year
export const getEnrollmentRequests = async (req, res) => {
  const { courseId, yearId } = req.params;
  try {
    const enrollments = getDb().collection("enrollmentrequests");

    const data = await enrollments.aggregate([
      { $match: { course_id: courseId, year_id: yearId, status: "pending" } },
      {
        $lookup: {
          from: "users",
          localField: "student_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
      { $project: { 
        _id: 1,
        student_id: 1, 
        course_id: 1, 
        year_id: 1, 
        status: 1,
        requestedAt: 1,
        "userInfo.name": 1, 
        "userInfo.email": 1 
      } }
    ]).toArray();

    res.json(data);
  } catch (err) {
    console.error("Get enrollment requests error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Teacher views ALL pending requests for their courses
export const getAllTeacherEnrollmentRequests = async (req, res) => {
  const teacher_id = req.user.id;
  try {
    const courses = getDb().collection("courses");
    const enrollments = getDb().collection("enrollmentrequests");

    // 1. Find all courses by this teacher
    const myCourses = await courses.find({ teacher_id }).toArray();
    const courseIds = myCourses.map(c => c._id.toString());

    // 2. Aggregate requests for those courses
    const data = await enrollments.aggregate([
      { $match: { course_id: { $in: courseIds }, status: "pending" } },
      {
        $lookup: {
          from: "users",
          localField: "student_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      {
        $lookup: {
          from: "courses",
          let: { c_id: "$course_id" },
          pipeline: [
            { $match: { $expr: { $eq: [{ $toString: "$_id" }, "$$c_id"] } } }
          ],
          as: "courseInfo"
        }
      },
      { $unwind: "$courseInfo" },
      { $project: { 
        _id: 1,
        student_name: "$userInfo.name",
        student_email: "$userInfo.email",
        course_title: "$courseInfo.title",
        course_id: 1,
        year_id: 1,
        requestedAt: 1,
        status: 1
      } }
    ]).toArray();

    res.json(data);
  } catch (err) {
    console.error("Get all teacher requests error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Teacher/Admin approves or rejects request
export const updateEnrollmentStatus = async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body; // "accepted" or "rejected"

  try {
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be 'accepted' or 'rejected'" });
    }

    const enrollments = getDb().collection("enrollmentrequests");
    const users = getDb().collection("users");

    const request = await enrollments.findOneAndUpdate(
      { _id: new ObjectId(requestId) },
      { $set: { status, reviewedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    const updatedRequest = request.value || request;

    if (!updatedRequest || !updatedRequest._id) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (status === "accepted") {
      await users.updateOne(
        { _id: updatedRequest.student_id },
        { $set: { course_id: updatedRequest.course_id, year_number: updatedRequest.year_id } }
      );
    }

    res.json({ message: `Request ${status}`, request: updatedRequest });
  } catch (err) {
    console.error("Update enrollment status error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Student checks their enrollment status with populated course details
export const getStudentEnrollments = async (req, res) => {
  const student_id = req.user.id;
  try {
    const enrollments = getDb().collection("enrollmentrequests");
    
    // Aggregation to join course details
    const data = await enrollments.aggregate([
      { $match: { student_id: new ObjectId(student_id) } },
      {
        $lookup: {
          from: "courses",
          let: { c_id: "$course_id" },
          pipeline: [
            { $match: { $expr: { $eq: [{ $toString: "$_id" }, "$$c_id"] } } }
          ],
          as: "course"
        }
      },
      { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } }
    ]).toArray();

    res.json(data);
  } catch (err) {
    console.error("Get student enrollments error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Student cancels their own pending request
export const cancelEnrollmentRequest = async (req, res) => {
  const { requestId } = req.params;
  const student_id = req.user.id;

  try {
    const enrollments = getDb().collection("enrollmentrequests");
    const result = await enrollments.deleteOne({ 
      _id: new ObjectId(requestId), 
      student_id: new ObjectId(student_id), 
      status: "pending" 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "No pending request found" });
    }

    res.json({ message: "Enrollment request cancelled" });
  } catch (err) {
    console.error("Cancel enrollment request error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Teacher/Admin views all accepted students in a course year
export const getCourseYearEnrollments = async (req, res) => {
  const { courseId, yearId } = req.params;
  try {
    const enrollments = getDb().collection("enrollmentrequests");
    const users = getDb().collection("users");

    const data = await enrollments.aggregate([
      { $match: { course_id: courseId, year_id: yearId, status: "accepted" } },
      {
        $lookup: {
          from: "users",
          localField: "student_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      { $project: { student_id: 1, course_id: 1, year_id: 1, "userInfo.name": 1, "userInfo.email": 1 } }
    ]).toArray();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Teacher/Admin unenrolls a student
export const unenrollStudent = async (req, res) => {
  const { courseId, yearId, studentId } = req.params;

  try {
    const enrollments = getDb().collection("enrollmentrequests");
    const users = getDb().collection("users");

    const result = await enrollments.updateOne(
      { student_id: new ObjectId(studentId), course_id: courseId, year_id: yearId, status: "accepted" },
      { $set: { status: "unenrolled", reviewedAt: new Date() } }
    );

    if (result.modifiedCount === 0) return res.status(404).json({ error: "Enrollment not found or already inactive" });

    await users.updateOne(
      { _id: new ObjectId(studentId) },
      { $unset: { course_id: "", year_number: "" } }
    );
    const payload = {
      id: studentId,
      role: "student"
      // no course_id, no year_number
    };

    const newToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });


    res.json({ message: "Student unenrolled successfully", token: newToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};