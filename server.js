import express from "express";
import cors from "cors";
import dayjs from "dayjs";
import { stripHtml } from "string-strip-html";
import Joi from "joi";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(cors());

let participants = [];
let messages = [];

if (fs.existsSync("./participants.txt")) {
  participants = JSON.parse(fs.readFileSync("./participants.txt"));
}

if (fs.existsSync("./messages.txt")) {
  messages = JSON.parse(fs.readFileSync("./messages.txt"));
}

app.post("/participants", (req, res) => {
  req.body.name = removeHtml(req.body.name);

  const schema = Joi.object({ name: Joi.string().min(1).required() });
  const { error } = schema.validate(req.body);

  if (
    error ||
    participants.find((participant) => participant.name === req.body.name)
  ) {
    return res.sendStatus(400);
  }
  participants.push({ name: req.body.name, lastStatus: Date.now() });
  messages.push({
    from: req.body.name,
    to: "Todos",
    text: "entra na sala...",
    type: "status",
    time: dayjs(Date.now()).format("HH:mm:ss"),
  });
  fs.writeFileSync("./participants.txt", JSON.stringify(participants));
  fs.writeFileSync("./messages.txt", JSON.stringify(messages));
  res.sendStatus(200);
});

app.get("/participants", (req, res) => {
  res.send(participants);
});

app.post("/messages", (req, res) => {
  req.body.text = removeHtml(req.body.text);
  req.body.to = removeHtml(req.body.to);
  const nameUser = removeHtml(req.header("User"));

  const schemaBody = Joi.object({
    to: Joi.string().min(1).required(),
    text: Joi.string().min(1).required(),
    type: Joi.any().valid("message", "private_message").required(),
  });
  const schemaHeaders = Joi.string().min(1).required();
  const errorBody = schemaBody.validate(req.body);
  const erroHeaders = schemaHeaders.validate(nameUser);

  if (
    errorBody.error ||
    erroHeaders.error ||
    !participants.find((participant) => participant.name === nameUser)
  ) {
    return res.sendStatus(400);
  }
  messages.push({
    ...req.body,
    from: nameUser,
    time: dayjs(Date.now()).format("HH:mm:ss"),
  });
  fs.writeFileSync("./messages.txt", JSON.stringify(messages));
  res.sendStatus(200);
});

app.get("/messages", (req, res) => {
  const limit = req.query.limit;
  const messagesToTheUser = messages.filter(
    (m) =>
      m.to === "Todos" ||
      m.to === req.header("User") ||
      m.from === req.header("User")
  );
  res.send(messagesToTheUser.slice(-limit));
});

app.post("/status", (req, res) => {
  const nameUser = stripHtml(`${req.header("User")}`).result.trim();
  const participantHere = participants.find(
    (participant) => participant.name === nameUser
  );
  if (!participantHere) {
    return res.sendStatus(400);
  }
  participantHere.lastStatus = Date.now();
  res.sendStatus(200);
});

setInterval(() => {
  participants.forEach((participant, index) => {
    if (Date.now() - participant.lastStatus > 10000) {
      participants.splice(index, 1);
      messages.push({
        from: participant.name,
        to: "Todos",
        text: "sai da sala...",
        type: "status",
        time: dayjs(Date.now()).format("HH:mm:ss"),
      });
      fs.writeFileSync("./participants.txt", JSON.stringify(participants));
      fs.writeFileSync("./messages.txt", JSON.stringify(messages));
    }
  });
}, 15000);

function removeHtml(html) {
  return stripHtml(`${html}`).result.trim();
}

app.listen(4000, () => console.log("Server Online"));
