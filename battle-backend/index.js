"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
const body_parser_1 = __importDefault(require("body-parser"));
const numberGame_js_1 = require("./numberGame.js");
const nanoid_1 = require("nanoid");
const GameNames = {
    // Vickrey: 'Vickrey',
    NumberGame: 'Number Game',
    PublicGoods: 'Public Goods',
    // CellWars: 'Cell Wars'
};
const app = (0, express_1.default)();
const port = 5000;
app.use((0, cors_1.default)());
app.options('*', (0, cors_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
const games = []; // { gameId: '', adminId: '', instance: gameInstance }
const wsServer = new ws_1.WebSocketServer({ noServer: true });
wsServer.on('connection', ws => {
    // assuming ws refers to a single connection
    // ws.send(JSON.stringify({what: 10}));
    // ws.send('hi');
    ws.on('message', (message) => handleMessage(JSON.parse(message)));
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
    const adminId = (0, nanoid_1.nanoid)(12);
    const gameId = (0, nanoid_1.nanoid)(12);
    const game = {
        gameId,
        adminId,
    };
    if (req.body.gameName === GameNames.NumberGame) {
        game.instance = (0, numberGame_js_1.createNumberGame)({ adminId });
    }
    else {
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
    res.send({ players: game.instance.getPlayerNames() });
});
app.post('/add-player', (req, res) => {
    const game = games.find(g => g.gameId === req.body.gameId);
    if (!game) {
        res.status(404).send("Sorry, can't find that game");
        return;
    }
    game.instance.addPlayer(req.body);
});
app.post('/start-game', (req, res) => {
    const game = games.find(g => g.gameId === req.body.gameId);
    if (!game) {
        res.status(404).send("Sorry, can't find that game");
        return;
    }
    game.instance.start(req.body.userId);
});
app.post('/reset-game', (req, res) => {
    const game = games.find(g => g.gameId === req.body.gameId);
    if (!game) {
        res.status(404).send("Sorry, can't find that game");
        return;
    }
    game.instance.reset(req.body.userId);
    res.status(200).send('Game reset');
});
app.post('/remove-player', (req, res) => {
    const game = games.find(g => g.gameId === req.body.gameId);
    if (!game) {
        res.status(404).send("Sorry, can't find that game");
        return;
    }
    game.instance.removePlayer(req.body.userId, req.body.playerName);
    res.status(200).send('Player removed');
});
app.listen(port, () => {
    console.log(`Battle app listening on port ${port}`);
});
