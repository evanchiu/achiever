<template>
  <div class="flex flex-col min-h-screen min-w-screen">
    <app-nav />
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
      shownAchievements: [],
      shownModes: ["pve", "pvp", "wvw"],
      level: 80,
      products: {
        HeartOfThorns: "HasAccess",
        PathOfFire: "HasAccess",
      },
    };
  },
  async mounted() {
    // Load Achiever database of extra details
    const dailydb = (await axios.get("/dailydb.json")).data;

    // Load list of daily achievements
    const daily = (
      await axios.get(
        "https://api.guildwars2.com/v2/achievements/daily?v=2019-05-16T00:00:00.000Z&lang=en"
      )
    ).data;

    // Query achivement details
    const ids = Object.keys(daily)
      .map((key) => daily[key].map((a) => a.id))
      .flat();
    const idString = ids.join(",");

    const details = (
      await axios.get(
        `https://api.guildwars2.com/v2/achievements?ids=${idString}`
      )
    ).data;

    // Details don't provide icon if it's the base PVE icon
    const defaultIcon = {
      icon:
        "https://render.guildwars2.com/file/483E3939D1A7010BDEA2970FB27703CAAD5FBB0F/42684.png",
    };

    // Combine data into achievements array
    const achievements = Object.keys(daily)
      .map((key) =>
        daily[key].map((a) =>
          Object.assign(
            {},
            a,
            { mode: key },
            defaultIcon,
            details.find((d) => d.id === a.id),
            dailydb[a.id]
          )
        )
      )
      .flat();
    this.allAchievements = achievements;

    // Filter those shown
    this.shownAchievements = achievements
      .filter(
        (a) =>
          this.shownModes.includes(a.mode) &&
          a.level.min <= this.level &&
          a.level.max >= this.level &&
          (!a.required_access ||
            this.products[a.required_access.product] ===
              a.required_access.condition)
      )
      .sort((a, b) => {
        if (!b.minutes) {
          return -1;
        } else if (!a.minutes) {
          return 1;
        } else {
          return a.minutes - b.minutes;
        }
      });
  },
};
</script>
<style src="./assets/tailwind.css"></style>
