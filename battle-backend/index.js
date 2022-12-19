const express = require('express')
const cors = require('cors');
const ws = require('ws');
const bodyParser = require('body-parser');
const app = express()
const port = 5000

app.use(cors())
app.options('*', cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const players = [

];

const wsServer = new ws.Server({ noServer: true });

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

app.get('/', (req, res) => {
  res.send({"what": 10})
})

app.get('/players', (req, res) => {});


app.post('/test', (req, res) => {
  res.send({"woah": "it works"});
});

app.post('/add-player', (req, res) => {
  func = new Function("return " + req.body.funcText)();
  const player = {
    name: req.body.name,
    execute: func
  };
  players.push(player);
  res.send({status: 400});
  wsServer.clients.forEach(c => {
    c.send(JSON.stringify({type: 'New Player', name: player.name}));
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
