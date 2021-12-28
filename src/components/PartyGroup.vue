<template>
  <div class="w-full">
    <div class="px-3 w-full flex flex-row">
      <div class="flex-grow text-xl">
        {{ group.name }}
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
      <party-category
        v-for="categoryId in group.categories"
        :key="categoryId"
        :categoryId="categoryId"
        :members="members"
        :memberAchieves="memberAchieves"
      />
    </div>
  </div>
</template>
<script>
import axios from "axios";
import PartyCategory from "./PartyCategory";

export default {
  components: {
    PartyCategory,
  },
  props: { groupId: String, members: Array, memberAchieves: Array },
  data() {
    return {
      group: {},
      open: false,
    };
  },
  created() {
    this.load();
  },
  methods: {
    async load() {
      this.group = (
        await axios.get(
          `https://api.guildwars2.com/v2/achievements/groups/${this.groupId}`
        )
      ).data;
    },
    toggle() {
      this.open = !this.open;
    },
  },
};
</script>
