import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    default: "TODO",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  priority: {
    type: String,
  },
  deadline: {
    type: Date,
  },
  helpfulNotes: {
    type: String,
  },
  relatedSkills: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Ticket = mongoose.model("Ticket", schema);
export default Ticket;
