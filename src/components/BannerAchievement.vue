<template>
  <div class="w-full md:w-1/2 lg:w-1/3 p-1 md:p-2">
    <div class="flex border-t-2 md:border-t-4" :style="tileStyle">
      <div class="shrink-0 rounded-b-lg" :style="imageStyle">
        <img
          class="h-8 w-8 md:h-12 md:w-12 xl:h-16 xl:w-16 banner"
          :src="achievement.icon"
          :alt="achievement.mode"
        />
      </div>
      <div class="ml-3 grow">
        <div class="md:text-xl text-gray-900 leading-tight">
          {{ achievement.name }}
        </div>
        <div class="text-xs lg:text-sm text-gray-600 leading-tight">
          {{ achievement.criterion }}
        </div>
        <ul
          v-if="achievement.encounters"
          class="text-xs lg:text-sm text-gray-900 leading-tight"
        >
          <li v-for="encounter in achievement.encounters" :key="encounter.id">
            <span v-if="encounter.cleared">✅</span
            ><span v-if="!encounter.cleared">❌</span>
            {{ encounter.name }}
            <span v-if="encounter.kpCount" class="text-gray-600">
              {{ encounter.kpCount }}kp &mdash; {{ encounter.kpCode }}
            </span>
          </li>
        </ul>
        <div
          v-if="achievement.assumption"
          class="text-sm text-gray-900 leading-tight pt-2"
        >
          *{{ achievement.assumption }}
        </div>
        <div v-if="location" class="text-sm text-gray-900 leading-tight pt-2">
          {{ location.location }}
        </div>
        <div
          v-if="location.notes"
          class="text-xs lg:text-sm text-gray-600 leading-tight"
        >
          {{ location.notes }}
        </div>
      </div>
      <div v-if="achievement.minutes" class="ml-3">
        <span class="text-xl md:text-3xl text-gray-800 leading-tight">{{
          achievement.minutes
        }}</span>
        <span
          v-if="achievement.assumption"
          class="text-xl md:text-3xl text-gray-800 leading-tight"
          >*</span
        >
      </div>
      <div v-if="achievement.callOfTheMists" class="ml-3 shrink-0">
        <img
          src="/Call_of_the_Mists_portal_icon.png"
          alt="Call of the Mists"
          title="Call of the Mists"
          class="h-10 w-10 md:h-12 md:w-12"
        />
      </div>
      <div v-if="achievement.emboldened" class="ml-3 shrink-0">
        <img
          src="/Emboldened_portal_icon.png"
          alt="Emboldened"
          title="Emboldended"
          class="h-10 w-10 md:h-12 md:w-12"
        />
      </div>
    </div>
  </div>
</template>
<script>
const modeToAccent = {
  pve: "#8500FF",
  pvp: "#ff9900",
  wvw: "#DD0000",
  fractals: "#0066cc",
  strike: "#008833",
  raid: "#661100",
};

export default {
  name: "BannerAchievement",
  props: {
    achievement: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      imageStyle: {},
      tileStyle: {},
      location: {},
    };
  },
  mounted() {
    const accent = modeToAccent[this.achievement.mode];
    this.imageStyle = { backgroundColor: accent };
    this.tileStyle = { borderColor: accent };
    if (this.achievement.locations) {
      this.location =
        this.achievement.locations[
          Math.floor(Math.random() * this.achievement.locations.length)
        ];
    }
  },
};
</script>
<style scoped>
img.banner {
  filter: saturate(0%) brightness(150%);
  mix-blend-mode: screen;
}
</style>
