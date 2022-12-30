import express from 'express';
import cors from 'cors';
import WebSocket, { WebSocketServer } from 'ws';
import bodyParser from 'body-parser'
import { createNumberGame } from './numberGame.js';
import { nanoid } from 'nanoid'



const GameNames = {
  Vickrey: 'Vickrey',
  NumberGame: 'Number Game',
  PublicGoods: 'Public Goods',
  CellWars: 'Cell Wars'
};


const app = express()
const port = 5000
app.use(cors())
app.options('*', cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const games = []; // { gameId: '', adminId: '', instance: gameInstance }

const wsServer = new WebSocketServer({ noServer: true });

wsServer.on('connection', ws => {
  // assuming ws refers to a single connection
  // ws.send(JSON.stringify({what: 10}));
  // ws.send('hi');
  ws.on('message', message => handleMessage(JSON.parse(message)));
  const MessageTypes = {
    AddClientToGame: 'AddClientToGame',
    StartGame: 'StartGame',
    ResetGame: 'ResetGame',
    PauseGame: 'PauseGame',
    AddPlayer: 'AddPlayer',
    RemovePlayer: 'RemovePlayer',
  };
  function handleMessage(m) {
    // expecting { data: {gameId, userId } }
    const game = games.find(x => x.gameId === m.data.gameId);
    if (!game) {
      return;
    }
    const instance = game.instance;

    if (m.type === MessageTypes.AddClientToGame) {
      instance.addClient({ socket: ws, userId: m.data.userId });
    } else if (m.type === MessageTypes.StartGame) {
      instance.start(m.data.userId);
    } else if (m.type === MessageTypes.ResetGame) {
      instance.reset(m.data.userId);
    } else if (m.type === MessageTypes.PauseGame) {
      instance.pause(m.data.userId);
    } else if (m.type === MessageTypes.AddPlayer) {
      instance.addPlayer(m.data.player); // { data: {gameId, player: {name, userId, execute}}}
    }
  }

});


const server = app.listen(3000);
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});

app.get('/game-names', (req, res) => {
  let names = [];
  for (let propName in GameNames) {
    names.push(GameNames[propName]);
  }
  res.send({ names });
});

app.post('/create-game', (req, res) => {
  // req.body.gameName
  const adminId = nanoid(12);
  const gameId = nanoid(12);
  const game = {
    gameId,
    adminId,
  };
  if (req.body.gameName === GameNames.NumberGame) {
    game.instance = createNumberGame({ adminId });
  } else {
    res.status(404).send("Sorry, can't find that game");
    return;
  }
  games.push(game);
  res.send({
    userId: adminId,
    gameId,
    gameName: req.body.gameName
  });
});

app.get('/players/:gameId', (req, res) => {
  const game = games.find(g => g.gameId === req.params.gameId);
  if (!game) {
    res.status(404).send("Sorry, can't find that game");
    return;
  }
  res.send({ players: game.getPlayerNames()});
});

// app.post('/start-game', (req, res) => {
//   if (players.length < 2) {
//     res.send({ status: 400, message: 'Not enough players' });
//     return;
//   }
//   res.send({ status: 200, message: 'Starting...' });
//   startGame({
//     rounds: req.body.rounds || 100,
//     players,
//     wsServer,
//   });
// });

// app.post('/stop-game', (req, res) => {
//   stopGame();
//   res.send({ status: 200, message: 'Game stopped' });
// });


// app.post('/add-player', (req, res) => {
//   const func = new Function("return " + req.body.funcText)();
//   const player = {
//     name: req.body.name,
//     execute: func
//   };
//   if (players.map(x => x.name).includes(player.name)) {
//     res.send({ status: 400, message: 'Player already exists' });
//     return;
//   }
//   players.push(player);
//   res.send({ status: 200 });
// wsServer.clients.forEach(c => {
//   c.send(JSON.stringify({
//     type: 'New Player',
//     data: {
//       playerNames: players.map(x => x.name)
//     }
//   }));
// });
// });

app.listen(port, () => {
  console.log(`Battle app listening on port ${port}`)
})
