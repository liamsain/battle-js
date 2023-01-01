/* 
  users begin with 20 points
  they should provide a function that returns a number between 0 and 100 inclusive
  the arg: { 
    multiplicationFactor: number from 1.01 to 1.99, 
    points: user points,
  }
  if a player gives a number of 50, 50% of their points will be submitted to the pot
  the pot is multiplied by the multiplication factor
  every player is rewarded with a fair share of the pot
*/
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
export function createPublicGoodsGame(config) {
  const adminId = config.adminId || '';
  let interval;
  let clients = []; // [{ socket, userId }]
  let players = []; // [{execute, points, name, userId, funcText}]
  let intervalMs = config.interval || 1000;
  const maxRounds = config.rounds || 100
  let multiplicationFactor = Math.floor(Math.random() * 99) + 1;
  let executeArg = {
    round: 1,
    maxRounds: maxRounds,
    previousGuesses: [],
    multiplicationFactor 
  };
  
  function executeRound() {
    executeArg.multiplicationFactor = Math.floor(Math.random() * 99) + 1;

    let pot = 0;
    players.forEach(p => {
      try {
        let perc = p.execute(executeArg);
        if (perc >= 0 && perc <= 100) {
          p.percentage = perc;
          pot += Math.floor((perc / 100) * p.points);
        }
      } catch(err) {
        console.log(`Failed to execute func for ${p.name}.`, err);
      }
    });

    pot = Math.floor(pot * ( 1 + (executeArg.multiplicationFactor / 100)));
    const playerReward = Math.floor(pot / players.length);
    players.forEach(p => {
      p.points += playerReward;
    });

    clients.forEach(c => {
      const sortedPlayers = players
        .map(({ execute, ...rest }) => rest) // remove execute function from response
        .sort((p1, p2) => p2.points - p1.points);
      c.socket.send(JSON.stringify({
        type: EventTypes.RoundComplete,
        data: {
          currentRound: executeArg.round,
          players: sortedPlayers
        }
      }));
    });
    executeArg.round += 1;
    // End of game check
    if (executeArg.round > maxRounds) {
      clearInterval(interval);
    }


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
    player.points = 20;
    player.percentage = 0;
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

  function addClient(client) {
    // if client exists, just remove and readd as we might need to refresh the socket obj
    // not sure if we need this!
    clients = clients.filter(c => c.userId !== client.userId);
    clients.push(client);
  }

  return {
    addPlayer,
    addClient
  }


}