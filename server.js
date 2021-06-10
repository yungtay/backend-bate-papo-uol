import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs'

const app = express();
app.use(express.json());
app.use(cors());

const participants = [{name: 'João', lastStatus: 12313123}];
const messages = [{from: 'teste', to: 'Todos', text: 'teste', type: 'message', time: '20:04:37'}];


app.post("/participants", (req, res) => {
  if (
    !req.body.name ||
    participants.find((participant) => participant.name === req.body.name)
  ) {
    return res.sendStatus(400);
  }
  participants.push({ name: req.body.name, lastStatus: Date.now() });
  messages.push({
    from: "xxx",
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
  if (
    !req.body.to ||
    !req.body.text ||
    !(req.body.type === "message" || req.body.type === "private_message") ||
    !participants.find((participant) => participant.name === req.header("User"))
  ) {
    return res.sendStatus(400);
  }
  messages.push({
    ...req.body,
    from: req.header("User"),
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
  const participantHere = participants.find(
    (participant) => participant.name === req.header("User")
  );
  if (!participantHere) {
    return res.sendStatus(400);
  }
  participantHere.lastStatus = Date.now();
  res.sendStatus(200)
});


app.listen(4000, () => console.log("Server Online"));