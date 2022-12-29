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
  gameInProgress,
  resetGame,
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
          Start
        </button>
        <button @click="stopGame" :disabled="!gameInProgress">Stop</button>
        <button @click="resetGame" :disabled="gameInProgress">Reset</button>
        <button @click="createGame" :disabled="gameInProgress">Create </button>
      </div>
    </template>
    <template #instructions>
      <ul>
        <li>Write a function that returns a number between 1 and 20</li>
        <li>
          If no other player guessed that number that round, you get that many
          points
        </li>
        <li>
          The argument to your function is an object that looks like this:
          <br /><code
            >{<br />&nbsp;round: 1,<br />&nbsp;maxRounds: 100,<br />&nbsp;previousGuesses:
            [<br />&nbsp;&nbsp;19, 2, 19, 20, 5<br />&nbsp;]<br />}</code
          >
        </li>
      </ul>
    </template>
    <template #game>
      <div class="">
        <h1 v-if="roundData">Round {{ roundData.currentRound }}/100</h1>
        <div>
          <TransitionGroup tag="ul" name="fade" v-if="roundData">
            <div
              v-for="p in roundData.players"
              class="item player"
              :key="p.name"
            >
              <p>
                <strong>{{ p.name }}:</strong>&emsp;{{ p.score }} {{ p.guess }}
              </p>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </template>
  </GameTemplate>
</template>
<style scoped>
.number-game-container {
  display: flex;
  justify-content: center;
}
.player {
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
  border-radius: 4px;
  padding: 8px;
  max-width: 180px;
  margin: 8px;
}
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
