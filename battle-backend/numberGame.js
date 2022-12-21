export const EventTypes = {
  NewPlayer: 'New Player',
  RoundComplete: 'Round Complete'
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

  wsServer.clients.forEach(c => {
    c.send(JSON.stringify({
      type: 'New Player',
      data: {
        playerNames: players.map(x => x.name)
      }
    }));
  });


}
