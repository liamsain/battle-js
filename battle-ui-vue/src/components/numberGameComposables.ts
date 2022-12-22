import { ref, onMounted } from 'vue';
import { useFetch, useWebSocket } from '@vueuse/core';
import { ApiUrl, ApiIp, WebSocketUrl } from '../api';

export const EventTypes = {
  NewPlayer: 'New Player',
  RoundComplete: 'Round Complete'
}

interface IEvent {
  type: string;
  data: any;
}
interface IRoundData {
  players: {
    name: string,
    score: number,
    guess: number,
  }[];
  currentRound: number;
}

export function useNumberGame() {
  const playerNames = ref<string[]>([]);
  const playerCode = ref(`function (arg) {
  // All of your code should go inside this function
  // arg: {round: 1, maxRounds: 100, previousGuesses: [19, 2, 19, 20, 5]}
  return 1;
}`);
  const playerName = ref('');
  const roundData = ref<IRoundData|null>(null);
  const gameInProgress = ref(false);

  const { status, data, send, open, close, ws } = useWebSocket(WebSocketUrl)
  // @ts-ignore
  ws.value.onmessage = ev => {
    handleEvent(JSON.parse(ev.data));
  }

  // setTimeout(() => {
  //   send(JSON.stringify({message: 'hi'}));
  // }, 1000);


  onMounted(async () => {
    const { isFetching, error, data, execute } = await useFetch(ApiUrl + '/players').json();
    playerNames.value = [...data.value.players];
  });

  function handleEvent(ev: IEvent) {
    if (ev.type == EventTypes.NewPlayer) {
      playerNames.value = ev.data.playerNames;
    } else if (ev.type == EventTypes.RoundComplete) {
      roundData.value = ev.data;
    }
  }

  async function onSubmit() {
    const { data } = await useFetch(ApiUrl + '/add-player').post({
      name: playerName.value,
      funcText: playerCode.value
    }).json()
  }
  async function startGame() {
    const { data } = await useFetch(ApiUrl + '/start-game').post();
    if (data.value.status == 200) {
      gameInProgress.value = true;
    }
  }
  async function stopGame() {
    const { data } = await useFetch(ApiUrl + '/stop-game').post();
    if (data.value.status == 200) {
      gameInProgress.value = false;
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
    gameInProgress
  }
}