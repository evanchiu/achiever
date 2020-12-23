<template>
  <div class="w-full md:w-1/2 lg:w-1/3 p-1 md:p-2">
    <div class="flex border-t-2 md:border-t-4" :style="tileStyle">
      <div class="flex-shrink-0 rounded-b-lg" :style="imageStyle">
        <img
          class="h-8 w-8 md:h-12 md:w-12 xl:h-16 xl:w-16"
          :src="achievement.icon"
          :alt="achievement.mode"
        />
      </div>
      <div class="ml-3 flex-grow">
        <div class="md:text-xl text-gray-900 leading-tight">
          {{ achievement.name }}
        </div>
        <div class="text-xs lg:text-sm text-gray-600 leading-tight">
          {{ achievement.criterion }}
        </div>
        <div
          class="text-sm text-gray-900 leading-tight pt-2"
          v-if="achievement.assumption"
        >
          *{{ achievement.assumption }}
        </div>
        <div class="text-sm text-gray-900 leading-tight pt-2" v-if="location">
          {{ location.location }}
        </div>
        <div
          class="text-xs lg:text-sm text-gray-600 leading-tight"
          v-if="location.notes"
        >
          {{ location.notes }}
        </div>
      </div>
      <div class="ml-3">
        <span class="text-xl md:text-3xl text-gray-800 leading-tight">{{
          achievement.minutes
        }}</span>
        <span
          v-if="achievement.assumption"
          class="text-xl md:text-3xl text-gray-800 leading-tight"
          >*</span
        >
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
};

export default {
  props: { achievement: Object },
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
      this.location = this.achievement.locations[
        Math.floor(Math.random() * this.achievement.locations.length)
      ];
    }
  },
};
</script>
<style scoped>
img {
  filter: saturate(0%) brightness(150%);
  mix-blend-mode: screen;
}
</style>
