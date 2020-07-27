<template>
  <div class="flex container flex-wrap m-auto mt-0">
    <achievement v-for="a in shownAchievements" :key="a.id" :achievement="a" />
  </div>
</template>

<script>
import Achievement from "../components/Achievement.vue";
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
  name: "Daily",
  components: {
    Achievement,
  },
  data() {
    return {
      allAchievements: [],
      shownModes: ["fractals"],
      sortType: "alpha",
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
};
</script>
