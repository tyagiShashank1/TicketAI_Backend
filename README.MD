# MAILTRAP
- Mailtrap is a fake/inbox simulator for testing emails in development.
- It catches your emails in a sandbox inbox instead of actually sending them to real email addresses

# SMTP
- SMTP (Simple Mail Transfer Protocol) is the protocol used to send emails from your application to an email server (like Gmail, Outlook, Yahoo, or Mailtrap).

- It’s basically the "post office rules" that define how one server gives an email to another.
 # Example flow:
- Your app → SMTP server (Mailtrap, Gmail, etc).
- SMTP server → recipient’s mail server.
- Recipient downloads via IMAP/POP3.
- So SMTP is just the sending pipeline.

 - Todos: Deploy backend to production, map all the configs, make it run successfully.