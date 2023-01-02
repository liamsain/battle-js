<script setup lang="ts">
import GameTemplate from "../components/GameTemplate.vue";
import { useNumberGame } from "../components/numberGameComposables";
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
  deletePlayer
} = useNumberGame();
</script>
<template>
  <GameTemplate
    v-model:playerCode="playerCode"
    v-model:playerName="playerName"
    :playerNames="playerNames"
    :disableEntry="gameInProgress"
    @submit="onSubmit"
    @deletePlayer="deletePlayer"
    gameName="Number game"
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
      <div class="number-game-container" v-if="roundData">
        <div>
          <h2>Round {{ roundData.currentRound }}/100</h2>
          <progress :value="roundData.currentRound" max="100">
            {{ roundData.currentRound }}
          </progress>
        </div>
        <div>
          <div class="player">
            <p><strong>Name</strong></p>
            <p><strong>Score</strong></p>
            <p><strong>Guess</strong></p>
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
              <p>
                {{ p.score }}
              </p>
              <p >
                {{ p.guess }}
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
.swap-move,
.swap-enter-active,
.swap-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. declare enter from and leave to state */
.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

/* 3. ensure leaving items are taken out of layout flow so that moving
      animations can be calculated correctly. */
.swap-leave-active {
  position: absolute;
}
</style>
