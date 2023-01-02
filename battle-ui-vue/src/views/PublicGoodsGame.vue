<script setup lang="ts">
import GameTemplate from "../components/GameTemplate.vue";
import { usePublicGoodsGame } from "../components/publicGoodsGameComposables";
import { userIsAdmin } from "../localData";
const {
  playerNames,
  playerName,
  playerCode,
  onSubmit,
  roundData,
  startGame,
  gameInProgress,
  resetGame,
  deletePlayer,
} = usePublicGoodsGame();
</script>
<template>
  <GameTemplate
    v-model:playerCode="playerCode"
    v-model:playerName="playerName"
    :playerNames="playerNames"
    :disableEntry="gameInProgress"
    @submit="onSubmit"
    @deletePlayer="deletePlayer"
    gameName="Public Goods"
  >
    <template #header>
      <div v-if="userIsAdmin()">
        <button @click="startGame" :disabled="playerNames.length < 2">
          Start
        </button>
        <button @click="resetGame" :disabled="gameInProgress">Reset</button>
      </div>
    </template>
    <template #instructions>
      <ul>
        <li>You start with 20 points </li>
        <li>Write a function that returns a number between 0 and 100 inclusive</li>
        <li>The number you provide is the percentage of your points that will be put into a pot. e.g. if you give the number 50, 50% of your points will be put into the pot</li>
        <li>The pot is multiplied by a number('multiplicationFactor') between 1.01 and 1.99</li>
        <li>Once the pot is multiplied, it is divided by the amount of players and each player gets their share</li>
  maxRounds: number;
  multiplicationFactor: number;

        <li>The argument to your function is an object that looks like this:<br/>
          <code>
            {<br />&nbsp;round: 3,<br />&nbsp;maxRounds: 100,<br />&nbsp;multiplicationFactor: 1.27<br />}
          </code>
        </li>
      </ul>
    </template>
    <template #game>
      <div class="public-goods-container" v-if="roundData">
        <div>
          <h2>Round {{ roundData.currentRound }}/100</h2>
          <progress :value="roundData.currentRound" max="100">
            {{ roundData.currentRound }}
          </progress>
        </div>
        <div>
          <div class="player">
            <p><strong>Name</strong></p>
            <p><strong>Percentage given</strong></p>
            <p><strong>Points</strong></p>
          </div>
          <TransitionGroup tag="div" name="swap">
            <div
              v-for="p in roundData.players"
              class="item player"
              :key="p.name"
            >
              <p >
                {{ p.name }}
              </p>
              <p >
                {{ p.percentage }}
              </p>
              <p>
                {{ p.points }}
              </p>

            </div>
          </TransitionGroup>
        </div>
      </div>

    </template>
  </GameTemplate>
</template>
<style scoped>
.public-goods-container{
  display: flex;
  align-items:center;
  justify-content:space-around;
}
.player {
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
  border-radius: 4px;
  display: flex;
  padding: 4px;
  margin: 4px;
  justify-content: space-between;
  min-width: 400px;
}
</style>
