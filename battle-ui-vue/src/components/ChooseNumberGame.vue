<script setup lang="ts">
import GameTemplate from "./GameTemplate.vue";
import { useNumberGame } from "./numberGameComposables";

const {
  playerNames,
  playerName,
  playerCode,
  onSubmit,
  roundData,
  startGame,
  stopGame,
  gameInProgress
} = useNumberGame();
</script>
<template>
  <GameTemplate
    v-model:playerCode="playerCode"
    v-model:playerName="playerName"
    :playerNames="playerNames"
    :disableEntry="gameInProgress"
    @submit="onSubmit"
    gameName="Number game"
  >
    <template #header>
      <div>
        <button @click="startGame" :disabled="playerNames.length < 2">
          Start game
        </button>
        <button @click="stopGame" :disabled="!gameInProgress">Stop game</button>

      </div>
    </template>
    <template #instructions>
      <ul>
        <li>Write a function that returns a number between 1 and 20</li>
        <li>
          If no other player guessed that number that round, you get that many
          points
        </li>
      </ul>
    </template>
    <template #game>
      <TransitionGroup tag="ul" name="fade" class="container" v-if="roundData">
        <h4>Round {{ roundData.currentRound}}/100</h4>
        <div v-for="p in roundData.players" class="item" :key="p.name">
          <p>{{ p.name }}&emsp;<strong>Score: </strong>{{ p.score }} <strong>Guess:</strong>{{p.guess}}</p>
        </div>
      </TransitionGroup>
    </template>
  </GameTemplate>
</template>
<style scoped>
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. declare enter from and leave to state */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

/* 3. ensure leaving items are taken out of layout flow so that moving
      animations can be calculated correctly. */
.fade-leave-active {
  position: absolute;
}
</style>
