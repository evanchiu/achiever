import Vue from "vue";
import VueRouter from "vue-router";
import Daily from "../views/Daily.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Daily",
    component: Daily,
  },
  {
    path: "/fractal",
    name: "Fractal",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Fractal.vue"),
  },
  {
    path: "/party/:token0?/:token1?/:token2?/:token3?/:token4?",
    name: "Party",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Party.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
