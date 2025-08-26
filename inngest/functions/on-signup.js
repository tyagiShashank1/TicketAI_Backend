import { inngest } from "../client.js";
import { sendMail } from "../../utils/mailer.js";
import User from "../../models/userModel.js";
import { NonRetriableError } from "inngest";

export const onUserSignUp = inngest.createFunction(
  { id: "on-users-signup", retries: 2 },
  { event: "user/signup" },
  async function ({ event, step }) {
    try {
      const { email } = event.data;
      //step1 - check whether user exists in DB
      const userObject = await step.run("get-user-email", async () => {
        const user = await User.findOne({ email: email });
        if (user) {
          return user;
        } else {
          throw new NonRetriableError("User no longer exists in our database");
        }
      });

      //step2 - send welcome mail
      await step.run("send-welcome-mail", async () => {
        const info = sendMail(
          userObject.email,
          "User Registeration",
          `Thanks ${email} for Signing up. We're glad to have you onboard!`
        );
      });
      return { success: true };
    } catch (error) {
      console.error("❌ Error running step", error.message);
      return { sucess: false };
    }
  }
);
