<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch, useWebSocket } from '@vueuse/core';
const apiUrl = 'http://localhost:5000';
const textareaCode = ref(`function (arg) {
  // arg: {round: 1, maxRounds: 100, previousGuesses: [19, 2, 19, 20, 5]}
  return 1; 
}`)
const name = ref('');
const playerNames = ref<string[]>([]);

const { status, data, send, open, close, ws } = useWebSocket('ws://localhost:3000')

ws.value.onmessage = ev => {
  console.log(ev);
}
// setTimeout(() => {
//   send(JSON.stringify({message: 'hi'}));
// }, 1000);

onMounted(async () => {
  const { isFetching, error, data, execute } = await useFetch(apiUrl + '/players');
  console.log(JSON.parse(data.value));
});

async function onSubmit(ev) {
  if (ev) {ev.preventDefault();}
      try {
      const func = new Function("return " + textareaCode.value)();
    } catch(err) {
      alert(err);
    }
    if (!name.value.length) {
      alert("Please supply a name");
      return;
    }
  const { data } = await useFetch(apiUrl + '/add-player').post({
    name: name.value,
    funcText: textareaCode.value
  }).json()
  console.log(data);
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
    <main>
      <h4>Results</h4>
    </main>
    <div class="right-sidebar">
      <h4 style="position: sticky; top: 0;"> Players</h4>
      <ul>
        <li v-for="p in playerNames" :key="p">{{ p }}</li>
      </ul>
    </div>
    <footer>
      <form >
        <div style="display: flex;align-items: stretch;">
          <fieldset style="flex-grow: 1;margin-left: 8px;" @submit="onSubmit">
            <legend><h4>Entry</h4></legend>
            <div>
              <input placeholder="name" v-model="name" type="text" required/>
              <textarea placeholder="Code" v-model="textareaCode" rows="16"></textarea>
            </div>
          </fieldset>
          <input type="submit" @click="onSubmit" id="submit-btn"/>
        </div>
      </form>
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
  padding: 4px;
  border: 1px solid grey;
  grid-column: 1 / 4;
}

textarea {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  padding: 0.5rem;
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
  background: #f7fcfc;
  padding: 1rem;
}

.right-sidebar {
  grid-column: 3 / 4;
  border: 1px solid grey;
  background: #f2f9f9;
  overflow-y: auto;
}

footer {
  grid-column: 1 / 4;
}

#submit-btn{
  padding: 20px;
  cursor: pointer;
  margin: 10px 4px 0 4px;
}

.left-sidebar,
.right-sidebar {
  padding: 0.5rem;
}
</style>