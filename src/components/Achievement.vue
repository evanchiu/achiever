<template>
  <div class="w-full md:w-1/2 lg:w-1/3 p-1 md:p-2">
    <div class="flex border-t-2 md:border-t-4" :style="tileStyle">
      <div class="flex-shrink-0 rounded-b-lg" :style="imageStyle">
        <img
          class="h-8 w-8 md:h-12 md:w-12 xl:h-16 xl:w-16"
          :src="achievement.icon"
          :alt="mode"
        />
      </div>
      <div class="ml-3 flex-grow">
        <span class="md:text-xl text-gray-900 leading-tight">{{
          achievement.name
        }}</span>
      </div>
      <div class="ml-3">
        <span class="text-xl md:text-3xl text-gray-800 leading-tight">{{
          achievement.minutes
        }}</span>
      </div>
    </div>
  </div>
</template>
<script>
const modeToAccent = {
  pve: "#8500FF",
  pvp: "#ff9900",
  wvw: "#DD0000",
};

export default {
  props: { achievement: Object },
  data() {
    return {
      imageStyle: {},
      tileStyle: {},
    };
  },
  mounted() {
    const accent = modeToAccent[this.achievement.mode];
    this.imageStyle = { backgroundColor: accent };
    this.tileStyle = { borderColor: accent };
  },
};
</script>
<style scoped>
img {
  filter: saturate(0%) brightness(150%);
  mix-blend-mode: screen;
}
</style>
