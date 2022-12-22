import express from 'express';
import cors from 'cors';
import WebSocket, { WebSocketServer } from 'ws';
import bodyParser from 'body-parser'
import { startGame, stopGame } from './numberGame.js';
const app = express()
const port = 5000

app.use(cors())
app.options('*', cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const players = [];

const wsServer = new WebSocketServer({ noServer: true });

wsServer.on('connection', s => {
  // s.send(JSON.stringify({what: 10}));
  s.on('message', message => console.log(JSON.parse(message)));
});

const server = app.listen(3000);
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});


app.get('/players', (req, res) => {
  res.send({ players: players.map(x => x.name) });
});

app.post('/start-game', (req, res) => {
  if (players.length < 2) {
    res.send({ status: 400, message: 'Not enough players' });
    return;
  }
  res.send({ status: 200, message: 'Starting...' });
  startGame({
    rounds: req.body.rounds,
    players,
    wsServer,
  });
});

app.post('/stop-game', (req, res) => {
  stopGame();
  res.send({ status: 200, message: 'Game stopped' });
});


app.post('/add-player', (req, res) => {
  const func = new Function("return " + req.body.funcText)();
  const player = {
    name: req.body.name,
    execute: func
  };
  if (players.map(x => x.name).includes(player.name)) {
    res.send({ status: 400, message: 'Player already exists' });
    return;
  }
  players.push(player);
  res.send({ status: 200 });
  wsServer.clients.forEach(c => {
    c.send(JSON.stringify({
      type: 'New Player',
      data: {
        playerNames: players.map(x => x.name)
      }
    }));
  });
});

app.listen(port, () => {
  console.log(`Battle app listening on port ${port}`)
})
