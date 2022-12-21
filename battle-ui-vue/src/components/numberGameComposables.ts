import { ref, onMounted } from 'vue';
import { useFetch, useWebSocket } from '@vueuse/core';
import { ApiUrl, ApiIp } from '../api';

export const EventTypes = {
  NewPlayer: 'New Player'
}

interface IEvent {
  type: string;
  data: any;
}

export function useNumberGame() {
  const playerNames = ref<string[]>([]);
  const playerCode = ref(`function (arg) {
  // arg: {round: 1, maxRounds: 100, previousGuesses: [19, 2, 19, 20, 5]}
  return 1;
}`);
  const playerName = ref('');

  const { status, data, send, open, close, ws } = useWebSocket(`ws://${ApiIp}:3000`)
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
    }
  }
  async function onSubmit() {
    const { data } = await useFetch(ApiUrl + '/add-player').post({
      name: playerName.value,
      funcText: playerCode.value
    }).json()
    console.log(data);
  }
  return {
    handleEvent,
    playerNames,
    playerCode,
    playerName,
    onSubmit
  }
}