import express from "express";
import { google } from "googleapis";

const app = express();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL,
);

app.get("/auth", (req, res) => {
  const scopes = ["https://www.googleapis.com/auth/calendar"];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });
  const link = "";

  res.redirect(url);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code as string;
  const { tokens } = await oauth2Client.getToken(code);

  console.log(tokens);
  res.send("Connectd You can close this tab now");
});

app.listen(3600, () => console.log("Server running on port 3600"));
