import express from "express";
import "dotenv/config";
import rateLimit from "express-rate-limit";

var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
var today  = new Date();

const DISCORD_WEBHOOK_URL = process.env.DISCORD;
const port = process.env.PORT;

console.log("ENV CHECK:", {
  webhook: !!DISCORD_WEBHOOK_URL,
  port: process.env.PORT
});

if (!DISCORD_WEBHOOK_URL || !port){
  throw new Error("Missing Discord Webhook or port in env");
}

const submitLimiter = rateLimit({
  windowMs: 5 * 60 * 60 * 1000, // 1 minute
  max: 2,             // 2 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.redirect("https://mmiyupid1012.github.io/mmiyupid.github.io/confessions.html?error=rate_limited");
  }
});


const app = express()

app.use(express.urlencoded({ extended: false }));


app.post("/submit", submitLimiter, async (req, res) =>{
  console.log("Received POST request");
  const {message} = req.body;

  if(!message){
    return res.redirect("https://mmiyupid1012.github.io/mmiyupid.github.io/confessions.html?error=missing");
  };

  const payload={
    "username": "Webhook",
    "content": "New confession has arrived!",
    "embeds":[{
      "author":{
        "name":"Anonymous"
      },
      "title":today.toLocaleDateString("en-US", options),
      "description": message,
    }]
  };

  try{
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok){
      throw new Error("Failed to send Webhook");
    }

  console.log("Sent to Discord");
  return res.redirect("https://mmiyupid1012.github.io/mmiyupid.github.io/confessions.html");

  }catch (err){
    return res.redirect("https://mmiyupid1012.github.io/mmiyupid.github.io/confessions.html?error=failed");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
