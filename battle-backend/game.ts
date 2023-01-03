import { useClients } from "./clients";
export interface IGameConfig {
  rounds?: number;
  interval?: number;
  adminId: string;
  onTick: <T extends IPlayerConfig>(players: T[], roundData: IRoundData) => void;
  onAddNewPlayer: <T extends IPlayerConfig>(p: IPlayerConfig) => T;
  onStart: () => void;
}
export const EventTypes = {
  PlayersUpdate: "Players Update", // todo: change this to 'Players Update'
  RoundComplete: "Round Complete",
};
export interface IPlayerConfig {
  name: string;
  userId: string;
  funcText: string;
  execute: (arg: any) => number;
}
export interface IRoundData {
  round: number;
  maxRounds: number;
}
export interface IExecuteArg {
  round: number;
  maxRounds: number;
  [key: string]: any;
}
export function useGame<
  PlayerType extends IPlayerConfig
>(config: IGameConfig) {
  const { sendMessageToClients, addClient } = useClients();
  const adminId = config.adminId || "";

  let interval: NodeJS.Timer;
  let players: PlayerType[] = [];

  let intervalMs = config.interval || 600;
  const maxRounds = config.rounds || 100;
  let roundData: IRoundData = {
    round: 1,
    maxRounds
  };

  function addPlayer(player: IPlayerConfig) {
    const existing = players.find((p) => p.name === player.name);

    const func = new Function("return " + player.funcText)();
    if (existing) {
      existing.execute = func;
      return;
    }

    const p: PlayerType = config.onAddNewPlayer<PlayerType>(player);
    players.push(p);
    sendMessageToClients({
      type: EventTypes.PlayersUpdate,
      data: {
        playerNames: players.map((x) => x.name),
      },
    });
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
  function start(userId: string) {
    if (userId !== adminId) {
      console.error("Cannot begin game. id is not admin id", userId);
      return;
    }
    if (!players.length) {
      console.error("Cannot begin game.No players");
      return;
    }
    if (roundData.round >= roundData.maxRounds) {
      roundData.round = 1;
    }
    config.onStart();
    interval = setInterval(executeRound, intervalMs);
    executeRound();
  }

  function executeRound() {
    config.onTick<PlayerType>(players, roundData);

    roundData.round += 1;

    // End of game check
    if (roundData.round > maxRounds) {
      clearInterval(interval);
    }
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
  }

  function getPlayerNames() {
    return players.map(x => x.name);
  }

  return {
    addPlayer,
    reset,
    start,
    removePlayer,
    addClient,
    getPlayerNames,
    pause
  };
}
