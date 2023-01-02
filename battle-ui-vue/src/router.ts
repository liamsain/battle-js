import { createRouter, createWebHistory } from 'vue-router';
import ChooseNumberGame from './views/ChooseNumberGame.vue';
import PublicGoodsGame from './views/PublicGoodsGame.vue';
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
  {
    path: '/public-goods/:gameId',
    component: PublicGoodsGame
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes
});
export {router};