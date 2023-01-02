import { ref, onMounted } from 'vue';
import { useFetch, useWebSocket } from "@vueuse/core";
import { ApiUrl, WebSocketUrl } from "../api";
import { getUserId } from "../localData";
import { useRoute, useRouter } from 'vue-router';

export const MessageTypesIn = {
  NewPlayer: "New Player",
  RoundComplete: "Round Complete",
};
export const MessageTypesOut = {
  AddClientToGame: "AddClientToGame",
}
export interface IUseGameConfig {
  initialPlayerCode: string;
  onReset?: () => any;
  onMessage?: (ev: IEvent) => void;
}

interface IEvent {
  type: string;
  data: any;
}
export function useGame(config: IUseGameConfig) {

  const route = useRoute();
  const router = useRouter();
  const playerName = ref('');
  const playerNames = ref<string[]>([]);
  const playerCode = ref(config.initialPlayerCode);
  const gameId = route.params.gameId;
  const gameInProgress = ref(false);

  const { status, data, send, open, close, ws } = useWebSocket(WebSocketUrl);
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
    console.log(ev);
    if (ev.type == MessageTypesIn.NewPlayer) {
      playerNames.value = ev.data.playerNames;
      console.log('hi');
    }
    if (config.onMessage) {
      config.onMessage(ev);
    }
  }


  async function onSubmit() {
    const { data, statusCode } = await useFetch(ApiUrl + "/add-player")
      .post({
        name: playerName.value,
        userId: getUserId(),
        funcText: playerCode.value,
        gameId,
      })
      .json();
    if (statusCode.value == 404) {
      router.push("/");
    }
  }
  async function startGame() {
    const { statusCode } = await useFetch(ApiUrl + "/start-game")
      .post({
        userId: getUserId(),
        gameId: gameId,
      })
      .json();
    if (statusCode.value == 200) {
      gameInProgress.value = true;
    }
    if (statusCode.value == 404) {
      router.push("/");
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
    playerNames.value = [];
    if (config.onReset) {
      config.onReset();
    }
  }
  async function deletePlayer(pName: string) {
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
    deletePlayer,
    resetGame,
    startGame,
    onSubmit,
    playerNames,
    playerName,
    playerCode,
    gameInProgress
  }
}