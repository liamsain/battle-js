<script setup lang="ts">
import GameTemplate from './GameTemplate.vue';
import { useNumberGame } from './numberGameComposables';

const { playerNames, playerName, playerCode, onSubmit } = useNumberGame();

</script>
<template>
  <GameTemplate v-model:playerCode="playerCode" v-model:playerName="playerName" @submit="onSubmit"
    gameName="Number game">
    <template #players>
      <ul>
        <li v-for="p in playerNames" :key="p">{{ p }}</li>
      </ul>
    </template>
    <template #instructions>
      <ul>
        <li>Write a function that returns a number between 1 and 20</li>
        <li>If no other player guessed that number that round, you get that many points</li>
      </ul>
    </template>
    <template #game></template>
  </GameTemplate>
</template>
<style scoped>

</style>