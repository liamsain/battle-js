import { createRouter, createWebHistory } from 'vue-router';
import ChooseNumberGame from './views/ChooseNumberGame.vue';
import Home from './views/Home.vue';

const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/number-game/:gameId',
    component: ChooseNumberGame
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes
});
export {router};