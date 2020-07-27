<template>
  <div class="flex flex-col min-h-screen min-w-screen">
    <app-nav />
    <router-view />
    <app-footer />
  </div>
</template>

<script>
import AppNav from "./components/AppNav.vue";
import AppFooter from "./components/AppFooter.vue";

export default {
  name: "App",
  components: {
    AppNav,
    AppFooter,
  },
};
</script>

<style src="./assets/tailwind.css"></style>
