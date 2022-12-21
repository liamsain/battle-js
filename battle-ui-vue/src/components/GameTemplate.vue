<script setup lang="ts">
import { computed, ref } from 'vue';
const props = defineProps<{
  gameName: string;
  playerName: string;
  playerCode: string;
}>();

const games = [
  'Number Game',
  'Core War',
  'Public Goods'
];
const selected = ref<string>(games[0]);

const computedPlayerName = computed({
  get(): string {
    return props.playerName
  },
  set(val: string) {
    emit('update:playerName', val)
  }
});
const computedPlayerCode = computed({
  get(): string {
    return props.playerCode;
  },
  set(val: string) {
    emit('update:playerCode', val);
  }
});

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'update:playerName', v: string): void;
  (e: 'update:playerCode', v: string): void;
}>();

function onSubmit(ev: any) {
  if (ev) { ev.preventDefault(); }

  try {
    const func = new Function("return " + props.playerCode)();
  } catch (err) {
    alert(err);
    return;
  }

  if (!props.playerName.length) {
    alert("Please supply a name");
    return;
  }
  emit('submit');
}
</script>
<template>
  <div class="container">
    <header>
      <div style="display: flex;justify-content:space-between">
        <h4>{{ gameName }}</h4>
        <div style="display: flex;">
          <!-- <h5 style="margin-right: 4px;">Games:</h5>
          <select v-model="selected">
            <option v-for="game in games" :key="game">{{ game }}</option>
          </select> -->
        </div>
      </div>
    </header>
    <div class="left-sidebar">
      <h4>Instructions</h4>
      <slot name="instructions" />
    </div>
    <main>
      <h4></h4>
      <slot name="game" />
    </main>
    <div class="right-sidebar">
      <h4 style="position: sticky; top: 0;">Players</h4>
      <slot name="players" />
    </div>
    <footer>
      <form>
        <div style="display: flex;align-items: stretch;">
          <fieldset style="flex-grow: 1;margin-left: 8px;" @submit="onSubmit">
            <legend>
              <h4>Entry</h4>
            </legend>
            <div>
              <input placeholder="name" v-model="computedPlayerName" type="text" required />
              <textarea placeholder="Code" v-model="computedPlayerCode" rows="16" ></textarea>
            </div>
          </fieldset>
          <input type="submit" @click="onSubmit" id="submit-btn" />
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
  border-bottom: 1px solid grey;
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
  /* padding: 1rem; */
}

.right-sidebar {
  grid-column: 3 / 4;
  border: 1px solid grey;
  background: #f2f9f9;
  overflow-y: auto;
}

footer {
  grid-column: 1 / 4;
  background: #f7fcfc;
}

#submit-btn {
  padding: 20px;
  cursor: pointer;
  margin: 10px 4px 0 4px;
}

.left-sidebar,
.right-sidebar {
  padding: 0.5rem;
}
</style>