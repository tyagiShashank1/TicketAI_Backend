import Ticket from "../models/ticketModel.js";
import { inngest } from "../inngest/client.js";

//create new ticket
export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }
    const ticket = await Ticket.create({
      title: title,
      description: description,
      createdBy: req.user._id.toString(),
    });
    if (!ticket) {
      return res.json({
        success: false,
        message: "Ticket cannot be created at the moment",
      });
    } else {
      //FIRE INNGEST EVENT
      await inngest.send({
        name: "ticket/created",
        data: {
          ticketId: ticket._id.toString(),
          title,
          description,
          createdBy: req.user._id.toString(),
        },
      });
    }
    return res.json({
      success: true,
      message: "Ticket created successfully !",
      ticket: ticket,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Ticket creation failed." });
  }
};

//get Tickets
export const getTickets = async (req, res) => {
 try {
   let tickets = [];
  if (req.user.role === "user") {
    tickets = await Ticket.find({ createdBy: req.user._id });
  } else {
    tickets = await Ticket.find({})
      .populate("assignedTo", ["email", "_id"])
      .sort({ createdAt: -1 })
      .lean();
  }
  return res
    .status(200)
    .json({
      success: true,
      message: "Ticket found successfully",
      tickets: tickets,
    });
 } catch (error) {
    console.error("Error fetching tickets", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
 }
};

//get a particular ticket

export const getTicket = async(req,res)=>{
 try {
    const user = req.user;
    let ticket;

    if (user.role !== "user") {
      ticket = await Ticket.findById(req.params.id).populate("assignedTo", [
        "email",
        "_id",
      ]);
    } else {
      ticket = await Ticket.findOne({
        createdBy: user._id,
        _id: req.params.id,
      }).select("title description status createdAt");
    }

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};