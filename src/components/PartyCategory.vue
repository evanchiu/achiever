<template>
  <div class="w-full">
    <div class="px-3 w-full flex flex-row">
      <img
        class="h-8 w-8 md:h-8 md:w-8"
        :src="category.icon"
        :alt="category.name"
      />
      <div class="flex-grow text-lg">
        {{ category.name }}
      </div>
      <span
        class="hover:bg-purple-300 text-purple-700 py-1 px-2 rounded"
        @click="toggle"
      >
        <span v-if="!open"> Open </span>
        <span v-if="open"> Close </span>
      </span>
    </div>
    <div v-if="open" class="pl-6">
      <party-achievement
        v-for="achievementId in category.achievements"
        :key="achievementId"
        :achievementId="achievementId"
        :members="members"
        :memberAchieves="memberAchieves"
      />
    </div>
  </div>
</template>
<script>
import axios from "axios";
import PartyAchievement from "./PartyAchievement";

export default {
  components: {
    PartyAchievement,
  },
  props: { categoryId: Number, members: Array, memberAchieves: Array },
  data() {
    return {
      category: {},
      open: false,
    };
  },
  created() {
    this.load();
  },
  methods: {
    async load() {
      this.category = (
        await axios.get(
          `https://api.guildwars2.com/v2/achievements/categories/${this.categoryId}`
        )
      ).data;
    },
    toggle() {
      this.open = !this.open;
    },
  },
};
</script>
