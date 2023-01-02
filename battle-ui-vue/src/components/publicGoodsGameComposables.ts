import { ref } from "vue";
import confetti from "canvas-confetti";
import { useGame } from "../composables/gameComposables";

export const MessageTypesIn = {
  NewPlayer: "New Player",
  RoundComplete: "Round Complete",
};
export const MessageTypesOut = {
  AddClientToGame: "AddClientToGame",
};
interface IEvent {
  type: string;
  data: any;
}
interface IRoundData {
  players: {
    name: string;
    points: number;
    percentage: number;
  }[];
  currentRound: number;
}
export function usePublicGoodsGame() {
  const initialPlayerCode = `function (arg) {
  // All code must go inside this function
  return Math.floor(Math.random() * 101);
}`;
  const roundData = ref<IRoundData | null>(null);
  const {
    deletePlayer,
    resetGame,
    startGame,
    onSubmit,
    playerNames,
    playerName,
    playerCode,
    gameInProgress,
  } = useGame({
    initialPlayerCode,
    onMessage: handleEvent,
    onReset: () => {
      roundData.value = null;
    }
  });

  function handleEvent(ev: IEvent) {
    if (ev.type == MessageTypesIn.RoundComplete) {
      roundData.value = ev.data;
    }
  }
  return {
    onSubmit,
    startGame,
    gameInProgress,
    resetGame,
    deletePlayer,
    playerNames,
    playerName,
    playerCode,

  }

}
