import WebSocket from "ws";
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
  NewPlayer: "New Player",
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
  const adminId = config.adminId || "";
  let interval: NodeJS.Timer;
  let clients: { socket: WebSocket.WebSocket; userId: string }[] = []; 
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
          pot += Math.floor((perc / 100) * p.points);
        }
      } catch (err) {
        console.log(`Failed to execute func for ${p.name}.`, err);
      }
    });

    pot = Math.floor(pot * (1 + executeArg.multiplicationFactor / 100));
    const playerReward = Math.floor(pot / players.length);
    players.forEach((p) => {
      p.points += playerReward;
    });

    clients.forEach((c) => {
      const sortedPlayers = players
        .map(({ execute, ...rest }) => rest) // remove execute function from response
        .sort((p1, p2) => p2.points - p1.points);
      c.socket.send(
        JSON.stringify({
          type: EventTypes.RoundComplete,
          data: {
            currentRound: executeArg.round,
            players: sortedPlayers,
          },
        })
      );
    });
    executeArg.round += 1;
    // End of game check
    if (executeArg.round > maxRounds) {
      clearInterval(interval);
    }
  }
  function addPlayer(player: {name: string;userId: string;funcText: string}) {
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
      funcText: player.funcText
    }
    players.push(newPlayer);
    clients.forEach((c) => {
      c.socket.send(
        JSON.stringify({
          type: EventTypes.NewPlayer,
          data: {
            playerNames: players.map((x) => x.name),
          },
        })
      );
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
        multiplicationFactor: Math.floor(Math.random() * 99) + 1
      };
      players.forEach((p) => {
        p.points = 0;
      });
    }
    interval = setInterval(executeRound, intervalMs);
    executeRound();
  }
  function pause(userId:string) {
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
      multiplicationFactor: Math.floor(Math.random() * 99) + 1
    };
    players = [];
  }



  function addClient(client: {socket: WebSocket.WebSocket;userId: string}) {
    // if client exists, just remove and readd as we might need to refresh the socket obj
    // not sure if we need this!
    clients = clients.filter((c) => c.userId !== client.userId);
    clients.push(client);
  }

  function removePlayer(userId: string, playerName: string) {
    if (userId !== adminId) {
      console.log("id is not admin id");
      return;
    }
    const player = players.find((p) => p.name === playerName);
    players = players.filter((p) => p.name !== playerName);
    if (player) {
      clients = clients.filter((c) => c.userId !== player.userId);
    }
    clients.forEach((c) => {
      c.socket.send(
        JSON.stringify({
          type: EventTypes.NewPlayer,
          data: {
            playerNames: players.map((x) => x.name),
          },
        })
      );
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
    reset
  };
}
