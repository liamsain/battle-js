import WebSocket from "ws";
export const EventTypes = {
  NewPlayer: "New Player",
  RoundComplete: "Round Complete",
};


export interface IPlayer {
  score: number;
  name: string;
  funcText: string;
  userId: string;
  execute: (arg: any) => number;
  guess: number;
  error?: boolean;
}

interface IExecuteArg {
  round: number;
  maxRounds: number;
  previousGuesses: number[]
}
export interface IConfig {
  rounds?: number;
  interval?: number;
  adminId: string;
}
export function createNumberGame(config: IConfig) {
  const adminId = config.adminId || "";
  let interval: NodeJS.Timer;
  let clients: { socket: WebSocket.WebSocket; userId: string }[] = [];
  let players: IPlayer[] = [];
  let intervalMs = config.interval || 600;
  const maxRounds = config.rounds || 100;
  let executeArg: IExecuteArg = {
    round: 1,
    maxRounds: maxRounds,
    previousGuesses: [],
  };

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
      executeArg = {
        round: 1,
        maxRounds: config.rounds || 100,
        previousGuesses: [],
      };
      players.forEach((p) => {
        p.score = 0;
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
  interface IPlayerConfig {
    name: string;
    userId: string;
    funcText: string;
  }
  function addPlayer(player: IPlayerConfig) {
    const existing = players.find((p) => p.name === player.name);

    const func = new Function("return " + player.funcText)();
    if (existing) {
      existing.execute = func;
      return;
    }
    const newPlayer: IPlayer = {
      name: player.name,
      execute: func,
      userId: player.userId,
      score: 0,
      funcText: player.funcText,
      guess: 0
    };
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
  function reset(userId: string) {
    if (userId !== adminId) {
      return;
    }

    pause(userId);
    executeArg = {
      round: 1,
      maxRounds: config.rounds || 100,
      previousGuesses: [],
    };
    // clients = [];
    players = [];
  }

  function executeRound() {
    let guesses: number[] = [];

    // Execute player functions and add their guesses to the array
    players.forEach((p) => {
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
    players.forEach((p) => {
      const guessMatches = guesses.filter((g) => g == p.guess);
      if (guessMatches.length === 1) {
        p.score += p.guess;
      }
    });

    // Send results to clients
    clients.forEach((c) => {
      const sortedPlayers = players
        .map(({ execute, ...rest }) => rest) // remove execute function from response
        .sort((p1, p2) => p2.score - p1.score);
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

    executeArg.previousGuesses = guesses;
    executeArg.round += 1;

    // End of game check
    if (executeArg.round > maxRounds) {
      clearInterval(interval);
    }
  }
  interface IClient {
    socket: WebSocket.WebSocket;
    userId: string
  }
  function addClient(client: IClient) {
    /* 
      If client exists, just remove and readd 
      as we might need to refresh the socket obj
      ...not sure if we need this
    */ 
    clients = clients.filter((c) => c.userId !== client.userId);
    clients.push(client);
  }
  function getPlayerNames() {
    return players.map((x) => x.name);
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

  return {
    pause,
    addPlayer,
    start,
    reset,
    addClient,
    getPlayerNames,
    removePlayer,
  };
}

