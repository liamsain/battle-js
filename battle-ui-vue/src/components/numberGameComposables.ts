import { ref } from "vue";
import confetti from "canvas-confetti";
import { useGame } from "../composables/gameComposables";
import { IEvent } from '../types/types';
export const MessageTypesIn = {
  PlayersUpdate: "Players Update",
  RoundComplete: "Round Complete",
};
export const MessageTypesOut = {
  AddClientToGame: "AddClientToGame",
};

interface IRoundData {
  players: {
    name: string;
    score: number;
    guess: number;
  }[];
  currentRound: number;
}

export function useNumberGame() {
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
    initialPlayerCode: `function (arg) {
  // All code must go inside this function
  // return 20;
  return Math.floor(Math.random() * 20) + 1;
}`,
    onMessage: handleEvent,
    onReset: () => {
      roundData.value = null;
    }
  });


  function handleEvent(ev: IEvent) {
    if (ev.type == MessageTypesIn.RoundComplete) {
      roundData.value = ev.data;
      if (roundData.value?.currentRound == 100) {
        confetti({
          particleCount: 150,
          spread: 120,
          origin: { y: 0.6 },
        });
      }
    }
  }


  return {
    handleEvent,
    playerNames,
    playerCode,
    playerName,
    onSubmit,
    roundData,
    startGame,
    gameInProgress,
    resetGame,
    deletePlayer,
  };
}
