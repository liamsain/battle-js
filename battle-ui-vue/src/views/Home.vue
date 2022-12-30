<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useFetch } from "@vueuse/core";
import { ApiUrl } from "../api";
import { useRouter } from "vue-router";
import { setUserId } from '../localData';
const router = useRouter();
const gameNames = ref<string[]>([]);
const creatingGame = ref(false);
onMounted(async () => {
  const { data } = await useFetch(ApiUrl + "/game-names").json();
  gameNames.value = data.value.names;
});

async function onChange(val) {
  console.log(val.target.value);
  creatingGame.value = true;
  const { data } = await useFetch<{userId: string;gameId:string;gameName:string;}>(ApiUrl + "/create-game")
    .post({
      gameName: val.target.value,
    })
    .json();

  const gameRoute = data.value.gameName.split(" ").join("-").toLowerCase();
  setUserId(data.value.userId);

  router.push(`/${gameRoute}/${data.value.gameId}`)
  creatingGame.value = false;
}
</script>
<template>
  <div class="home-container">
    <div>
      <h4>Choose a game</h4>
      <select @change="onChange" :disabled="creatingGame">
        <option disabled selected value>-- select a game --</option>
        <option v-for="n in gameNames" :key="n">{{ n }}</option>
      </select>
    </div>
  </div>
</template>
<style>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
