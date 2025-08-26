import { inngest } from "../client.js";
import Ticket from "../../models/ticketModel.js";
import { NonRetriableError } from "inngest";
import analyzeTicket from "../../utils/ai.js";
import { sendMail } from "../../utils/mailer.js";
import User from "../../models/userModel.js";

export const onTicketCreate = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async function ({ event, step }) {
    try {
      const { ticketId } = event.data;
      console.log("Ticket Id receved from controller is ",ticketId);
      //step1: find ticket in the database
      const ticketObject = await step.run("check-ticket-created", async () => {
        const ticket = await Ticket.findById(ticketId);
         console.log("Ticket found in the DB is ",ticket);
        if (!ticket)
          throw new NonRetriableError(
            "Ticket no longer exists in our database"
          );
        else {
          return ticket;
        }
      });
         console.log("Ticket Object is ", ticketObject);
      //step 2: Update ticket status to "TODO"
      await step.run("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticketObject._id, { status: "In Progress" });
      });

      //step3: Run AI-AGENT to fetch ticket details to fullfill further
      const aiResponse = await analyzeTicket(ticketObject);
      console.log("AI RESPONSE IS", aiResponse);

      //step 4: Update Ticket based on AI response and return skills
      const relatedskills = await step.run("ai-processing", async () => {
        let skills = [];
        if (aiResponse) {
          await Ticket.findByIdAndUpdate(ticketObject._id, {
            priority: !["low", "medium", "high"].includes(aiResponse.priority)
              ? "medium"
              : aiResponse.priority,
            helpfulNotes: aiResponse.helpfulNotes,
            status: "IN_PROGRESS",
            relatedSkills: aiResponse.relatedSkills,
          });
          skills = aiResponse.relatedSkills;
        }
        return skills;
      });

      //step5: Assign moderator based on skills
      const moderator = await step.run("assign-moderator", async () => {
        let user = await User.findOne({
          role: "moderator",
          skills: {
            $elemMatch: {
              $regex: relatedskills.join("|"),
              $options: "i",
            },
          },
        });
        if (!user) {
          user = await User.findOne({
            role: "admin",
          });
        }
        await Ticket.findByIdAndUpdate(ticketObject._id, {
          assignedTo: user?._id || null,
        });
        return user;
      });

      //step 6: send email notiofication to moderator
      await step.run("send-email-notification", async () => {
        if (moderator) {
          const finalTicket = await Ticket.findById(ticketObject._id);
          await sendMail(
            moderator.email,
            "Ticket Assigned",
            `A new ticket is assigned to you ${finalTicket.title}`
          );
        }
      });
 
      return { success: true };
    } catch (error) {
      console.error("❌ Error running step in on Ticket Create", error.message);
      return { sucess: false };
    }
  }
);
