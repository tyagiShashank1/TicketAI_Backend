import { Inngest } from "inngest";

// Create a client to send and receive events
// A client in Inngest is simply the connection point between your app and Inngest.
export const inngest = new Inngest({
  id: "ticketing-system",
  eventKey: process.env.INNGEST_SERVER_API_KEY,
});

// What this client does

// When you call inngest.send() → it sends an event to Inngest servers.

// When you use inngest.createFunction() → it defines a function that will run when a specific event happens.
