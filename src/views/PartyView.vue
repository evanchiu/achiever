<template>
  <div class="flex container flex-wrap m-auto mt-0">
    <div class="w-full text-sm"></div>
    <div class="flex flex-row w-full">
      <div v-for="member in members" :key="member.id" class="p-3 flex-grow">
        <div class="text-xl">{{ member.name }}</div>
        <div class="text-sm text-gray-800">
          Fractal: {{ member.fractal_level }}
        </div>
        <div class="text-sm text-gray-800">WvW: {{ member.wvw_rank }}</div>
      </div>
    </div>
    <party-group
      v-for="groupId in groupIds"
      :key="groupId"
      :groupId="groupId"
      :members="members"
      :memberAchieves="achievements"
    />
  </div>
</template>

<script>
import axios from "axios";
import PartyGroup from "../components/PartyGroup";

export default {
  name: "PartyView",
  components: {
    PartyGroup,
  },
  data() {
    return {
      achievements: [],
      groupIds: [],
      members: [],
    };
  },
  computed: {
    tokens: function () {
      const tokens = [];
      for (let i = 0; i < 5; i++) {
        if (this.$route.params[`token${i}`]) {
          tokens.push(this.$route.params[`token${i}`]);
        }
      }
      return tokens;
    },
  },
  created() {
    this.updateMembers();
    this.loadAchievements();
  },
  methods: {
    async updateMembers() {
      this.members = (
        await Promise.all(
          this.tokens.map((token) => {
            return axios.get(
              `https://api.guildwars2.com/v2/account?access_token=${token}`,
            );
          }),
        )
      ).map((response) => response.data);
      this.achievements = (
        await Promise.all(
          this.tokens.map((token) => {
            return axios.get(
              `https://api.guildwars2.com/v2/account/achievements?access_token=${token}`,
            );
          }),
        )
      ).map((response) => response.data);
    },
    async loadAchievements() {
      this.groupIds = (
        await axios.get("https://api.guildwars2.com/v2/achievements/groups")
      ).data;
    },
  },
};
</script>
