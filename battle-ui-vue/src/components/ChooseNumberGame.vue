<script setup lang="ts">
import { ref } from 'vue';
const textareaCode = ref(`function (arg) {
  // arg: {round: 1, maxRounds: 100, previousGuesses: [19, 2, 19, 20, 5]}
  return 20
}`)
function onSubmit() {
  console.log('hi');
}
</script>
<template>
  <div class="container">
    <header>
      <h4>Number game</h4>
    </header>
    <div class="left-sidebar">
      <h4>Instructions</h4>
      <ul>
        <li>Write a function that returns a number between 1 and 20</li>
        <li>If no other player guessed that number that round, you get that many points</li>
      </ul>
    </div>
    <main >
      <h4 >Results</h4>
    </main>
    <div class="right-sidebar" >
      <h4 style="position: sticky; top: 0;"> Players</h4>
    </div>
    <footer >
      <textarea placeholder="Code" v-model="textareaCode"></textarea>
      <button @click="onSubmit">Submit</button>
    </footer>
  </div>
</template>
<style scoped>
.container {
  display: grid;
  height: 100vh;
  grid-template: auto minmax(40%, 60%) 1fr / 220px 1fr 220px;
}

header {
  background: #66bfbf; 
  padding: 12px;
  border: 1px solid grey;
  grid-column: 1 / 4;
}
textarea {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  padding: 1rem;
  background: #fcfefe; 
}

.left-sidebar {
  background: #eaf6f6; 
  grid-column: 1 / 2;
  border: 1px solid grey;
  overflow-y: auto;
}

main {
  grid-column: 2 / 3;
  border: 1px solid grey;
  background: #fcfefe; 
  padding: 1rem;
}

.right-sidebar {
  grid-column: 3 / 4;
  border: 1px solid grey;
  background: #f9adbf; 
  overflow-y: auto;
}

footer {
  grid-column: 1 / 4;
  display: flex;
  place-items: center;
}
footer button {
  height: 100%;
  padding: 20px;
  cursor: pointer;
  /* background: #66bfbf; 
  border: 1px solid grey;; */
}

.left-sidebar,
.right-sidebar {
  padding: 0.5rem;
}
</style>