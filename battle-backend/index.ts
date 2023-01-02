import express from "express";
import cors from "cors";
import WebSocket, { WebSocketServer } from "ws";
import bodyParser from "body-parser";
import { createNumberGame } from "./numberGame";
import { nanoid } from "nanoid";

interface IGameInstance {
  pause: (userId: string) => void;
  addPlayer: (player: any) => void;
  start: (userId: string) => void;
  reset: (userId: string) => void;
  addClient: (client: any) => void;
  getPlayerNames: () => string[];
  removePlayer: (userId: string, playerName: string) => void;
}
const GameNames: any = {
  // Vickrey: 'Vickrey',
  NumberGame: "Number Game",
  PublicGoods: "Public Goods",
  // CellWars: 'Cell Wars'
};

const app = express();
const port = 5000;
app.use(cors());
app.options("*", cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const games: { gameId: string; adminId: string; instance: IGameInstance }[] =
  [];

const wsServer = new WebSocketServer({ noServer: true });

wsServer.on("connection", (ws) => {
  // assuming ws refers to a single connection
  // ws.send(JSON.stringify({what: 10}));
  // ws.send('hi');
  ws.on("message", (message: string) => handleMessage(JSON.parse(message)));
  const MessageTypes = {
    AddClientToGame: "AddClientToGame",
    StartGame: "StartGame",
    ResetGame: "ResetGame",
    PauseGame: "PauseGame",
    AddPlayer: "AddPlayer",
    RemovePlayer: "RemovePlayer",
  };
  interface IMessage {
    data: {
      gameId: string;
      userId:string;
    },
    type: string;
  }
  function handleMessage(m: IMessage) {
    // expecting { data: {gameId, userId } }
    const game = games.find((x) => x.gameId === m.data.gameId);
    if (!game) {
      return;
    }
    const instance = game.instance;

    if (m.type === MessageTypes.AddClientToGame) {
      instance.addClient({ socket: ws, userId: m.data.userId });
    }
  }
});

const server = app.listen(3000);
server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit("connection", socket, request);
  });
});

app.get("/game-names", (req, res) => {
  let names = [];
  for (let propName in GameNames) {
    names.push(GameNames[propName]);
  }
  res.send({ names });
});

app.post("/create-game", (req, res) => {
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
    gameName: req.body.gameName,
  });
});

app.get("/players/:gameId", (req, res) => {
  const game = games.find((g) => g.gameId === req.params.gameId);
  if (!game) {
    res.status(404).send("Sorry, can't find that game");
    return;
  }
  res.send({ players: game.instance.getPlayerNames() });
});

app.post("/add-player", (req, res) => {
  const game = games.find((g) => g.gameId === req.body.gameId);
  if (!game) {
    res.status(404).send("Sorry, can't find that game");
    return;
  }
  game.instance.addPlayer(req.body);
});

app.post("/start-game", (req, res) => {
  const game = games.find((g) => g.gameId === req.body.gameId);
  if (!game) {
    res.status(404).send("Sorry, can't find that game");
    return;
  }

  game.instance.start(req.body.userId);
});
app.post("/reset-game", (req, res) => {
  const game = games.find((g) => g.gameId === req.body.gameId);
  if (!game) {
    res.status(404).send("Sorry, can't find that game");
    return;
  }
  game.instance.reset(req.body.userId);
  res.status(200).send("Game reset");
});

app.post("/remove-player", (req, res) => {
  const game = games.find((g) => g.gameId === req.body.gameId);
  if (!game) {
    res.status(404).send("Sorry, can't find that game");
    return;
  }

  game.instance.removePlayer(req.body.userId, req.body.playerName);
  res.status(200).send("Player removed");
});

app.listen(port, () => {
  console.log(`Battle app listening on port ${port}`);
});