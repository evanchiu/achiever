<template>
  <div class="flex flex-col min-h-screen min-w-screen">
    <app-nav :fractal-button-label="buttonLabel" v-on:toggle="toggleMode" />
    <div class="flex container flex-wrap m-auto mt-0">
      <achievement
        v-for="a in shownAchievements"
        :key="a.id"
        :achievement="a"
      />
    </div>
    <app-footer />
  </div>
</template>

<script>
import Achievement from "./components/Achievement.vue";
import AppNav from "./components/AppNav.vue";
import AppFooter from "./components/AppFooter.vue";
import axios from "axios";

const sorts = {
  time: (a, b) => {
    if (!b.minutes) {
      return -1;
    } else if (!a.minutes) {
      return 1;
    } else {
      return a.minutes - b.minutes;
    }
  },
  alpha: (a, b) => a.name.localeCompare(b.name),
};

export default {
  name: "App",
  components: {
    AppNav,
    Achievement,
    AppFooter,
  },
  data() {
    return {
      allAchievements: [],
      buttonLabel: "Fractals",
      shownModes: ["pve", "pvp", "wvw"],
      sortType: "time",
      level: 80,
      products: {
        HeartOfThorns: "HasAccess",
        PathOfFire: "HasAccess",
      },
    };
  },
  computed: {
    shownAchievements: function () {
      if (this.allAchievements.length) {
        return this.allAchievements
          .filter(
            (a) =>
              this.shownModes.includes(a.mode) &&
              a.level.min <= this.level &&
              a.level.max >= this.level &&
              (!a.required_access ||
                this.products[a.required_access.product] ===
                  a.required_access.condition)
          )
          .sort(sorts[this.sortType]);
      } else {
        return [];
      }
    },
  },
  async mounted() {
    this.allAchievements = (
      await axios.get("https://achiever-api.roxtar.co/daily")
    ).data;
  },
  methods: {
    toggleMode() {
      if (this.buttonLabel === "Fractals") {
        this.buttonLabel = "Dailies";
        this.shownModes = ["fractals"];
        this.sortType = "alpha";
      } else {
        this.buttonLabel = "Fractals";
        this.shownModes = ["pve", "pvp", "wvw"];
        this.sortType = "time";
      }
    },
  },
};
</script>
<style src="./assets/tailwind.css"></style>
