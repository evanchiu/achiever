import { createRouter, createWebHistory } from "vue-router";
import DailyView from "../views/DailyView.vue";

const routes = [
  {
    path: "/",
    name: "Daily",
    component: DailyView,
  },
  {
    path: "/daily/:gw2Token?/:dpsToken?",
    name: "Auth Daily",
    component: DailyView,
  },
  {
    path: "/party/:token0?/:token1?/:token2?/:token3?/:token4?",
    name: "Party",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/PartyView.vue"),
  },
  {
    path: "/multi/:token*",
    name: "Multi",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/MultiView.vue"),
  },
  {
    path: "/raid-summary/:gw2Token?/:dpsToken?",
    name: "RaidSummary",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/RaidSummaryView.vue"),
  },
  {
    path: "/wallet/:gw2Token?",
    name: "Wallet",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/WalletView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
