<template>
  <div class="flex container flex-wrap m-auto mt-0">
    <div class="w-full flex px-2">
      <h1 class="text-xl md:text-3xl flex-initial">Daily</h1>
    </div>
    <achievement v-for="a in shownAchievements" :key="a.id" :achievement="a" />
    <div class="w-full flex px-2">
      <h1 class="text-xl md:text-3xl flex-initial">Priority Strike</h1>
    </div>
    <achievement v-for="a in strikeAchievements" :key="a.id" :achievement="a" />
    <div class="w-full flex px-2">
      <h1 class="text-xl md:text-3xl flex-initial">Daily Fractals</h1>
    </div>
    <achievement
      v-for="a in dailyFractalAchievements"
      :key="a.id"
      :achievement="a"
    />
    <div class="w-full flex px-2">
      <h1 class="text-xl md:text-3xl flex-initial">Recommended Fractals</h1>
    </div>
    <achievement
      v-for="a in recommendedFractalAchievements"
      :key="a.id"
      :achievement="a"
    />
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
    const today = (await axios.get("https://achiever-api.roxtar.co/today"))
      .data;
    this.allAchievements = today.daily;
    this.strikeAchievements = [
      {
        name: today.strike.strike.strike_mission,
        icon:
          "https://render.guildwars2.com/file/483E3939D1A7010BDEA2970FB27703CAAD5FBB0F/42684.png",
        mode: "strike",
      },
    ];
    this.dailyFractalAchievements = today.fractals.daily
      .sort((a, b) => Math.max(...b.scales) - Math.max(...a.scales))
      .map((a) => {
        return {
          name: a.name,
          icon:
            "https://render.guildwars2.com/file/A442B13E7B0D4A2F7136702FA858EA0C9F0CE4B3/1228223.png",
          mode: "fractals",
          criterion: a.scales.reverse().join(", "),
        };
      });
    this.recommendedFractalAchievements = today.fractals.recommended
      .sort((a, b) => b.scale - a.scale)
      .map((a) => {
        return {
          name: a.name,
          icon:
            "https://render.guildwars2.com/file/4A5834E40CDC6A0C44085B1F697565002D71CD47/1228226.png",
          mode: "fractals",
          criterion: a.scale,
        };
      });
  },
};
</script>
