import express from "express";
import cors from "cors";
import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";
import { onUserSignUp } from "./inngest/functions/on-signup.js";
import { onTicketCreate } from "./inngest/functions/on-ticket-create.js";
import dbConnect from "./database/dbConnection.js";
import userRouter from "./routes/user.js";
import ticketRouter from "./routes/ticket.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();

//middlewares
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.INNGEST_SERVER_API_KEY],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

//PORT
const port = process.env.PORT;

//DB CONNECTION
dbConnect();

//set routes
app.use("/api/auth", userRouter);
app.use("/api/tickets", ticketRouter);

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onUserSignUp, onTicketCreate],
  })
);

//APP ROUTE
app.get("/", (req, res) => {
  res.send("hey brother, good to see you back :)");
});

//APP LISTENING
app.listen(port, () => {
  console.log(`✅ App is up and running on port: ${port}`);
});
