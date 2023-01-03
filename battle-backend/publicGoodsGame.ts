import { useClients } from "./clients";
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
  PlayersUpdate: "Players Update",
  RoundComplete: "Round Complete",
};
export interface IConfig {
  rounds?: number;
  interval?: number;
  adminId: string;
}
interface IPlayer {
  execute: (arg: any) => number;
  points: number;
  name: string;
  userId: string;
  funcText: string;
  percentage: number;
}
interface IExecuteArg {
  round: number;
  maxRounds: number;
  multiplicationFactor: number;
}
export function createPublicGoodsGame(config: IConfig) {
  const { sendMessageToClients, addClient } = useClients();
  const adminId = config.adminId || "";
  let interval: NodeJS.Timer;
  let players: IPlayer[] = [];
  let intervalMs = config.interval || 1000;
  const maxRounds = config.rounds || 100;
  let multiplicationFactor = Math.floor(Math.random() * 99) + 1;
  let executeArg: IExecuteArg = {
    round: 1,
    maxRounds: maxRounds,
    multiplicationFactor,
  };

  function executeRound() {
    executeArg.multiplicationFactor = Math.floor(Math.random() * 99) + 1;

    let pot = 0;
    players.forEach((p) => {
      try {
        let perc = p.execute(executeArg);
        if (perc >= 0 && perc <= 100) {
          p.percentage = perc;
          const toAdd = Math.floor((perc / 100) * p.points);
          pot += toAdd;
          p.points -= toAdd;
        }
      } catch (err) {
        console.log(`Failed to execute func for ${p.name}.`, err);
      }
    });
    console.log(`pot before: ${pot}`);
    pot = Math.floor(pot * (1 + executeArg.multiplicationFactor / 100));
    console.log(`pot after: ${pot}`);
    const playerReward = Math.floor(pot / players.length);
    players.forEach((p) => {
      p.points += playerReward;
    });
    const sortedPlayers = players
      .map(({ execute, ...rest }) => rest) // remove execute function from response
      .sort((p1, p2) => p2.points - p1.points);

    sendMessageToClients({
      type: EventTypes.RoundComplete,
      data: {
        currentRound: executeArg.round,
        players: sortedPlayers,
      },
    });
    executeArg.round += 1;
    // End of game check
    if (executeArg.round > maxRounds) {
      clearInterval(interval);
    }
  }
  function addPlayer(player: {
    name: string;
    userId: string;
    funcText: string;
  }) {
    const existing = players.find((p) => p.name === player.name);

    const func = new Function("return " + player.funcText)();
    if (existing) {
      existing.execute = func;
      return;
    }
    const newPlayer: IPlayer = {
      execute: func,
      points: 20,
      percentage: 0,
      name: player.name,
      userId: player.userId,
      funcText: player.funcText,
    };
    players.push(newPlayer);
    sendMessageToClients({
      type: EventTypes.PlayersUpdate,
      data: {
        playerNames: players.map((x) => x.name),
      },
    });
  }
  function start(userId: string) {
    if (userId !== adminId) {
      console.log("id is not admin id", userId);
      return;
    }
    if (!players.length) {
      console.log("no players");
      return;
    }
    if (executeArg.round >= maxRounds) {
      // reset and start again
      executeArg = {
        round: 1,
        maxRounds: config.rounds || 100,
        multiplicationFactor: Math.floor(Math.random() * 99) + 1,
      };
      players.forEach((p) => {
        p.points = 0;
      });
    }
    interval = setInterval(executeRound, intervalMs);
    executeRound();
  }
  function pause(userId: string) {
    if (userId !== adminId) {
      return;
    }

    clearInterval(interval);
  }

  function reset(userId: string) {
    if (userId !== adminId) {
      return;
    }

    pause(userId);
    executeArg = {
      round: 1,
      maxRounds: config.rounds || 100,
      multiplicationFactor: Math.floor(Math.random() * 99) + 1,
    };
    players = [];
  }

  function removePlayer(userId: string, playerName: string) {
    if (userId !== adminId) {
      console.log("id is not admin id");
      return;
    }
    players = players.filter((p) => p.name !== playerName);
    sendMessageToClients({
      type: EventTypes.PlayersUpdate,
      data: {
        playerNames: players.map((x) => x.name),
      },
    });
  }
  function getPlayerNames() {
    return players.map((x) => x.name);
  }

  return {
    addPlayer,
    addClient,
    start,
    removePlayer,
    getPlayerNames,
    reset,
  };
}
