export const EventTypes = {
  NewPlayer: 'New Player',
  RoundComplete: 'Round Complete'
}
let interval;
export function stopGame() {
  clearInterval(interval);
}
/**
 * @param {Object} config 
 * @param {number} config.rounds  - the number of rounds in the game
 * @param {Object} config.wsServer  - the web socket server to send messages on
 * @param {Object[]} config.players
 * @param {string} config.players[].name - player name
 * @param {string} config.players[].execute - text of function to execute
 */
export function startGame(config) {
  let currentRound = 1;

  // arg: {round: 1, maxRounds: 100, previousGuesses: [19, 2, 19, 20, 5]}
  const executeArg = {
    round: 1,
    maxRounds: config.rounds,
    previousGuesses: []
  };
  const players = config.players.map(p => ({
    score: 0,
    guess: 0,
    name: p.name,
    execute: p.execute
  }));

  interval = setInterval(executeRound, 1000);
  function executeRound() {
    let guesses = [];
    players.forEach(p => {
      try {
        const guess = p.execute(executeArg);
        if (guess > 0 && guess <= 20) {
          p.guess = guess;
          guesses.push(guess);
        }
      } catch (err) {
        console.error(`Failed to execute function for ${p.name}. `, err);
      }
    });

    players.forEach(p => {
      const guessMatches = guesses.filter(g => g == p.guess);
      if (guessMatches.length === 1) {
        p.score += p.guess
      }
    });
    
    config.wsServer.clients.forEach(c => {
      c.send(JSON.stringify({
        type: EventTypes.RoundComplete,
        data: {
          players: players.map(({execute, ...rest}) => rest).sort((p1, p2) => p2.score - p1.score),
          currentRound
        }
      }));
    });
    
    executeArg.previousGuesses = guesses;
    currentRound += 1;
    if (currentRound > config.rounds) {
      clearInterval(interval);
    }
  }
}
