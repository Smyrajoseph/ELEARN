import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // links to your User model
      required: true,
      unique: true,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      required: true,
    },
    avatar_url: {
      type: String,
      default: "",
    },
    preferences: {
      type: Object, // flexible JSON object for theme, language, etc.
      default: {},
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "profiles" }
);

export default mongoose.model("Profile", profileSchema);