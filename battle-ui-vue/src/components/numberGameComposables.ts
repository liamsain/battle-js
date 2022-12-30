import { ref, onMounted } from "vue";
import { useFetch, useWebSocket } from "@vueuse/core";
import { ApiUrl, WebSocketUrl } from "../api";
import confetti from "canvas-confetti";
import { useRoute } from 'vue-router';

export const EventTypes = {
  NewPlayer: "New Player",
  RoundComplete: "Round Complete",
};

interface IEvent {
  type: string;
  data: any;
}
interface IRoundData {
  players: {
    name: string;
    score: number;
    guess: number;
  }[];
  currentRound: number;
}

export function useNumberGame() {
  const route = useRoute();
  const gameId = route.params.gameId;
  console.log(gameId);
  const playerNames = ref<string[]>([]);
  const playerCode = ref(`function (arg) {
  // All code should go inside this function
  return 20;
}`);
  const playerName = ref("");
  const roundData = ref<IRoundData | null>(null);
  const gameInProgress = ref(false);

  const { status, data, send, open, close, ws } = useWebSocket(WebSocketUrl);
  console.log(data);
  // @ts-ignore
  ws.value.onmessage = (ev) => {
    console.log(ev);
    handleEvent(JSON.parse(ev.data));
  };

  onMounted(async () => {
    // const { isFetching, error, data, execute } = await useFetch(
    //   ApiUrl + "/players"
    // ).json();
    // playerNames.value = [...data.value.players];
    confetti({
      particleCount: 150,
      spread: 120,
      origin: { y: 0.6 },
    });
  });

  function handleEvent(ev: IEvent) {
    if (ev.type == EventTypes.NewPlayer) {
      playerNames.value = ev.data.playerNames;
    } else if (ev.type == EventTypes.RoundComplete) {
      roundData.value = ev.data;
    }
  }


  async function onSubmit() {
    const { data } = await useFetch(ApiUrl + "/add-player")
      .post({
        name: playerName.value,
        funcText: playerCode.value,
      })
      .json();
  }
  async function startGame() {
    const { data } = await useFetch(ApiUrl + "/start-game")
      .post({
        rounds: 100,
      })
      .json();
    if (data.value.status == 200) {
      gameInProgress.value = true;
    }
  }
  async function stopGame() {
    const { data } = await useFetch<{ status: number }>(
      ApiUrl + "/stop-game"
    ).post();
    if (data.value?.status == 200) {
      gameInProgress.value = false;
    }
  }
  function resetGame() {
    send(JSON.stringify({ event: "reset" }));
  }

  return {
    handleEvent,
    playerNames,
    playerCode,
    playerName,
    onSubmit,
    roundData,
    startGame,
    stopGame,
    gameInProgress,
    resetGame,
  };
}
