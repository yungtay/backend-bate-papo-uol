import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs'

const app = express();
app.use(express.json());
app.use(cors());

const participants = [{name: 'João', lastStatus: 12313123}];
const messages = [{from: 'João', to: 'Todos', text: 'oi galera', type: 'message', time: '20:04:37'}];

app.post("/participants", (req, res) => {
    if (!req.body.name || participants.find((participant) => participant.name === req.body.name)) {
        return res.status(400)
      }
      participants.push({name: req.body.name, lastStatus: Date.now()})
      messages.push({from: 'xxx', to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs(Date.now()).format('HH-mm-ss')})
     res.status(200)
});



app.listen(4000, () => console.log("Server Online"));