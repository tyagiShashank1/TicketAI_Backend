import mongoose from "mongoose";

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "moderator", "admin"],
  },
  skills: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    required: true,
  },
});

const User = mongoose.model("User", schema);

export default User;
