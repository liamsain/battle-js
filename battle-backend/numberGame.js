export const EventTypes = {
  NewPlayer: 'New Player',
  RoundComplete: 'Round Complete'
}
/**
 * @param {Object} config 
 * @param {number} config.rounds  - the number of rounds in the game. Default 100
 * @param {number} config.interval  - the ms between each round. Default 1000
 * @param {string} config.adminId  - the id of the admin
 */
export function createNumberGame(config) {
  const adminId = config.adminId || '';
  let interval;
  let clients = []; // [{ socket, userId }]
  let players = [];
  let intervalMs = config.interval || 1000;
  const maxRounds = config.rounds || 100
  let executeArg = {
    round: 1,
    maxRounds: maxRounds,
    previousGuesses: []
  };

  function start(userId) {
    if (userId !== adminId) {
      return;
    }
    if (!players.length) {
      return;
    }
    interval = setInterval(executeRound, intervalMs);
    executeRound();
  }

  function pause(userId) {
    if (userId !== adminId) {
      return;
    }

    clearInterval(interval);
  }
  /**
   * @param {Object} player 
   * @param {string} player.name  - the name of the player
   * @param {string} player.userId  - the name of the player
   * @param {string} player.funcText - text of the function to execute
  */
  function addPlayer(player) {

    const existing = players.find(p => p.name === player.name);

    const func = new Function("return " + player.funcText)();
    if (existing) {
      existing.execute = func;
      return;
    }
    player.execute = func;
    player.score = 0;
    players.push(player);
    clients.forEach(c => {
      c.socket.send(JSON.stringify({
        type: EventTypes.NewPlayer,
        data: {
          playerNames: players.map(x => x.name)
        }
      }));
    });
  }
  function reset(userId) {
    if (userId !== adminId) {
      return;
    }

    pause();
    executeArg = {
      round: 1,
      maxRounds: config.rounds || 100,
      previousGuesses: []
    };
    clients = [];
    players = [];
  }

  function executeRound() {
    let guesses = [];

    // Execute player functions and add their guesses to the array
    players.forEach(p => {
      try {
        const guess = p.execute(executeArg);
        if (guess > 0 && guess <= 20) {
          p.guess = guess;
          guesses.push(guess);
        }
        p.error = false;
      } catch (err) {
        console.error(`Failed to execute function for ${p.name}. `, err);
        p.error = true;
      }
    });

    // Increment players' scores by guess if their guess was unique
    players.forEach(p => {
      const guessMatches = guesses.filter(g => g == p.guess);
      if (guessMatches.length === 1) {
        p.score += p.guess
      }
    });

    // Send results to clients
    clients.forEach(c => {
      // config.wsServer.clients.forEach(c => {
      const sortedPlayers = players
        .map(({ execute, ...rest }) => rest) // remove execute function from response
        .sort((p1, p2) => p2.score - p1.score);
      c.socket.send(JSON.stringify({
        type: EventTypes.RoundComplete,
        data: {
          currentRound: executeArg.round,
          players: sortedPlayers
        }
      }));
    });

    executeArg.previousGuesses = guesses;
    executeArg.round += 1;

    // End of game check
    if (executeArg.round > maxRounds) {
      clearInterval(interval);
    }
  }
  /**
   * @param {Object} client 
   * @param {Object} client.socket  - the client socket
   * @param {string} client.userId - the user id of the client
  */
  function addClient(client) {
    // if client exists, just remove and readd as we might need to refresh the socket obj
    // not sure if we need this
    clients = clients.filter(c => c.userId !== client.userId);
    clients.push(client);
  }
  function getPlayerNames() {
    return players.map(x => x.name);
  }

  return {
    pause,
    addPlayer,
    start,
    reset,
    addClient,
    getPlayerNames
  }
}

/**
 * @param {Object} config 
 * @param {number} config.rounds  - the number of rounds in the game
 * @param {Object} config.wsServer  - the web socket server to send messages on
 * @param {Object[]} config.players
 * @param {string} config.players[].name - player name
 * @param {string} config.players[].execute - text of function to execute
 */
