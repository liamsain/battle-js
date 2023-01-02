import { ApiUrl, WebSocketUrl } from "../api";
import { useFetch, useWebSocket } from "@vueuse/core";
import { ref, onMounted } from "vue";
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
    points: number;
    percentage: number;
  }[];
  currentRound: number;
}
export function usePublicGoodsGame() {
  const route = useRoute();
  const router = useRouter();

  const gameId = route.params.gameId;
  const playerNames = ref<string[]>([]);
  const playerCode = ref(`function (arg) {
  // All code must go inside this function
  return Math.floor(Math.random() * 101);
}`);
  const playerName = ref("");
  const roundData = ref<IRoundData | null>(null);
  const gameInProgress = ref(false);

  const { status, data, send, open, close, ws } = useWebSocket(WebSocketUrl);
  // @ts-ignore
  ws.value.onmessage = (ev) => {
    handleEvent(JSON.parse(ev.data));
  };

  function handleEvent(ev: IEvent) {
    if (ev.type == MessageTypesIn.NewPlayer) {
      playerNames.value = ev.data.playerNames;
    } else if (ev.type == MessageTypesIn.RoundComplete) {
      roundData.value = ev.data;
    }
  }
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
}
