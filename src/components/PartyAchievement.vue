<template>
  <div class="w-full">
    <div class="px-3 w-full flex flex-row">
      <div class="flex-grow">
        <div class="w-full">
          {{ achievement.name }} ({{ achievement.type }})
        </div>
        <div class="w-full text-xs text-gray-700">
          {{ achievement.requirement }}
        </div>
      </div>
      <div>
        <div class="flex flex-row w-full">
          <div
            v-for="(member, index) in members"
            :key="member.id"
            class="flex flex-row text-sm"
          >
            <div class="pr-1">{{ nickName(member.name) }}</div>
            <div v-if="!memberStatus[index]" class="pr-1">0%</div>
            <div v-else class="pr-1">
              <div v-if="memberStatus[index].done">100%</div>
              <div v-if="!memberStatus[index].done">
                {{
                  Math.round(
                    (100 * memberStatus[index].current) /
                      memberStatus[index].max,
                  )
                }}%
              </div>
            </div>
          </div>
        </div>
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
      <pre class="text-xs">{{ achievement }}</pre>
      <div v-for="(member, index) in members" :key="member.id">
        <div class="w-full">{{ member.name }}</div>
        <pre class="text-xs">{{ memberStatus[index] }}</pre>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";

export default {
  props: {
    achievementId: { type: Number, required: true },
    members: { type: Array, required: true },
    memberAchieves: { type: Array, required: true },
  },
  data() {
    return {
      achievement: {},
      open: false,
    };
  },
  computed: {
    memberStatus: function () {
      const achievementId = this.achievementId;
      return this.memberAchieves.map((memberAchievements) => {
        return memberAchievements.find(
          (achievement) => achievement.id == achievementId,
        );
      });
    },
  },
  created() {
    this.load();
  },
  methods: {
    async load() {
      this.achievement = (
        await axios.get(
          `https://api.guildwars2.com/v2/achievements?ids=${this.achievementId}`,
        )
      ).data[0];
    },
    toggle() {
      this.open = !this.open;
    },
    nickName(name) {
      return name.split(/ |\./)[0];
    },
  },
};
</script>
