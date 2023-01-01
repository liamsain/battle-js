<script setup lang="ts">
import { computed, ref, shallowRef } from "vue";
import { Codemirror } from "vue-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { userIsAdmin } from "../localData";

const props = defineProps<{
  gameName: string;
  playerName: string;
  playerCode: string;
  playerNames: string[];
  disableEntry: boolean;
}>();
const emit = defineEmits<{
  (e: "submit"): void;
  (e: "deletePlayer", playerName: string): void;
  (e: "update:playerName", v: string): void;
  (e: "update:playerCode", v: string): void;
}>();


const extensions = [javascript()];

// Codemirror EditorView instance ref
const view = shallowRef();
const handleReady = (payload: any) => {
  view.value = payload.view;
};

// Status is available at all times via Codemirror EditorView
const getCodemirrorStates = () => {
  const state = view.value.state;
  const lines = state.doc.lines;
};
const computedPlayerName = computed({
  get(): string {
    return props.playerName;
  },
  set(val: string) {
    emit("update:playerName", val);
  },
});
const computedPlayerCode = computed({
  get(): string {
    return props.playerCode;
  },
  set(val: string) {
    emit("update:playerCode", val);
  },
});


function onSubmit(ev: any) {
  if (ev) {
    ev.preventDefault();
  }

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
  emit("submit");
}
</script>
<template>
  <div class="container">
    <header>
      <div style="display: flex; justify-content: space-between">
        <h4 style="margin-left: 4px;">{{ gameName }}</h4>
        <slot name="header" />
        <!-- <div style="display: flex;">
          <h5 style="margin-right: 4px;">Games:</h5>
          <select v-model="selected">
            <option v-for="game in games" :key="game">{{ game }}</option>
          </select>
        </div> -->
      </div>
    </header>
    <div class="left-sidebar">
      <h4>Instructions</h4>
      <slot name="instructions" />
    </div>
    <main>
      <slot name="game" />
    </main>
    <div class="right-sidebar">
      <h4 style="position: sticky; top: 0">Players</h4>
      <ul>
        <li v-for="p in playerNames" :key="p">
          {{ p }}
          <button v-if="userIsAdmin()" @click="emit('deletePlayer', p)">X</button>
        </li>
      </ul>

      <slot name="players" />
    </div>
    <footer>
      <form>
        <div style="display: flex; align-items: stretch">
          <fieldset style="flex-grow: 1; margin-left: 8px" @submit="onSubmit">
            <legend>
              <h4>Entry</h4>
            </legend>
            <div>
              <input
                placeholder="Name *"
                v-model="computedPlayerName"
                type="text"
                required
              />
              <codemirror
                v-model="computedPlayerCode"
                placeholder="Code goes here..."
                :style="{ height: '300px' }"
                :indent-with-tab="true"
                :tab-size="2"
                :extensions="extensions"
                @ready="handleReady"
              />
            </div>
          </fieldset>
          <input
            type="submit"
            @click="onSubmit"
            id="submit-btn"
            :disabled="disableEntry"
          />
        </div>
      </form>
    </footer>
  </div>
</template>
<style scoped>
.container {
  display: grid;
  height: 100vh;
  grid-template: auto minmax(40%, 70%) 1fr / 220px 1fr 220px;
}

header {
  background: #66bfbf;
  padding: 4px;
  border-bottom: 1px solid #647d7d;
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
  overflow-y: auto;
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
