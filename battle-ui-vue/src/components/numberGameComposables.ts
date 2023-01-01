import { ref, onMounted } from "vue";
import { useFetch, useWebSocket } from "@vueuse/core";
import { ApiUrl, WebSocketUrl } from "../api";
import confetti from "canvas-confetti";
import { useRoute, useRouter } from "vue-router";
import { getUserId } from "../localData";

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
    score: number;
    guess: number;
  }[];
  currentRound: number;
}

export function useNumberGame() {
  const route = useRoute();
  const router = useRouter();

  const gameId = route.params.gameId;
  const playerNames = ref<string[]>([]);
  const playerCode = ref(`function (arg) {
  // All code must go inside this function
  // return 20;
  return Math.floor(Math.random() * 20) + 1;
}`);
  const playerName = ref("");
  const roundData = ref<IRoundData | null>(null);
  const gameInProgress = ref(false);

  const { status, data, send, open, close, ws } = useWebSocket(WebSocketUrl);
  console.log(data);
  // @ts-ignore
  ws.value.onmessage = (ev) => {
    handleEvent(JSON.parse(ev.data));
  };

  onMounted(async () => {
    send(
      JSON.stringify({
        type: MessageTypesOut.AddClientToGame,
        data: { userId: getUserId(), gameId },
      })
    );
    const { isFetching, error, data, execute, statusCode } = await useFetch(
      ApiUrl + "/players/" + gameId
    ).json();
    if (statusCode.value == 404) {
      // can't find game. time to go home!
      router.push("/");
      close();
      return;
    }
    playerNames.value = [...data.value.players];
  });

  function handleEvent(ev: IEvent) {
    console.log(ev.data);
    if (ev.type == MessageTypesIn.NewPlayer) {
      playerNames.value = ev.data.playerNames;
    } else if (ev.type == MessageTypesIn.RoundComplete) {
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

  async function onSubmit() {
    const { data, statusCode } = await useFetch(ApiUrl + "/add-player")
      .post({
        name: playerName.value,
        userId: getUserId(),
        funcText: playerCode.value,
        gameId: gameId,
      })
      .json();
    if (statusCode.value == 404) {
      router.push("/");
    }
  }
  async function startGame() {
    const { data, statusCode } = await useFetch(ApiUrl + "/start-game")
      .post({
        userId: getUserId(),
        gameId: gameId,
      })
      .json();
    if (data.value.status == 200) {
      gameInProgress.value = true;
    }
    if (statusCode.value == 404) {
      router.push("/");
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
  async function resetGame() {
    const { data } = await useFetch<{ status: number }>(
      ApiUrl + "/reset-game"
    ).post({
      userId: getUserId(),
      gameId: gameId,
    });
    gameInProgress.value = false;
    roundData.value = null;
    playerNames.value = [];
  }
  async function deletePlayer(pName: string) {
    console.log(pName);
    const { data, statusCode } = await useFetch<{ status: number }>(
      ApiUrl + "/remove-player"
    ).post({
      userId: getUserId(),
      gameId: gameId,
      playerName: pName
    });
    if(statusCode.value == 200) {
      playerNames.value = playerNames.value.filter(p => p !== pName);
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
    stopGame,
    gameInProgress,
    resetGame,
    deletePlayer
  };
}
