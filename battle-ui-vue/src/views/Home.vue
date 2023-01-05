<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useFetch } from "@vueuse/core";
import { ApiUrl } from "../api";
import { useRouter } from "vue-router";
import { setUserId, setUserIsAdmin } from "../localData";
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
  const { data } = await useFetch<{
    userId: string;
    gameId: string;
    gameName: string;
  }>(ApiUrl + "/create-game")
    .post({
      gameName: val.target.value,
    })
    .json();

  const gameRoute = data.value.gameName.split(" ").join("-").toLowerCase();
  setUserId(data.value.userId);
  // user is admin cause they created the game!
  setUserIsAdmin();

  router.push(`/${gameRoute}/${data.value.gameId}`);
  creatingGame.value = false;
}
</script>
<template>
  <div class="home-container">
    <div>
      <div style="text-align: center;">
        <h4>Choose a game</h4>
        <select @change="onChange" :disabled="creatingGame">
          <option disabled selected value>-- Select a Game --</option>
          <option v-for="n in gameNames" :key="n">{{ n }}</option>
        </select>
      </div>
    </div>
    <p style="padding-top: 40px;">
      Choosing a game will create a new room in which you are the admin. You will have
      control over starting and resetting the game
    </p>
    <p>Share the link to invite other people to invite them into the same room</p>
  </div>
</template>
<style>
.home-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
