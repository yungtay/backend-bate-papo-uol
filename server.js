import express from "express";
import cors from "cors";
import dayjs from "dayjs";
import { stripHtml } from "string-strip-html";

const app = express();
app.use(express.json());
app.use(cors());

const participants = [{ name: "João", lastStatus: 12313123 }];
const messages = [
  {
    from: "teste",
    to: "Todos",
    text: "teste",
    type: "message",
    time: "20:04:37",
  },
];

app.post("/participants", (req, res) => {
  const nameUser = (stripHtml(`${req.body.name}`).result).trim();

  if (
    !nameUser ||
    participants.find((participant) => participant.name === nameUser)
  ) {
    return res.sendStatus(400);
  }
  participants.push({ name: nameUser, lastStatus: Date.now() });
  messages.push({
    from: nameUser,
    to: "Todos",
    text: "entra na sala...",
    type: "status",
    time: dayjs(Date.now()).format("HH:mm:ss"),
  });
  res.sendStatus(200);
});

app.get("/participants", (req, res) => {
  res.send(participants);
});

app.post("/messages", (req, res) => {
  const nameUser = (stripHtml(`${req.header("User")}`).result).trim();
  const messageUser = (stripHtml(`${req.body.text}`).result).trim();
  if (
    !req.body.to ||
    !messageUser ||
    !(req.body.type === "message" || req.body.type === "private_message") ||
    !participants.find((participant) => participant.name === nameUser)
  ) {
    return res.sendStatus(400);
  }
  messages.push({
    ...req.body,
    text: messageUser,
    from: nameUser,
    time: dayjs(Date.now()).format("HH:mm:ss"),
  });
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
  const nameUser = (stripHtml(`${req.header("User")}`).result).trim();
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
    }
  });
}, 15000);

app.listen(4000, () => console.log("Server Online"));