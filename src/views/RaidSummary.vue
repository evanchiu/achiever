<template>
  <div class="flex container flex-wrap m-auto mt-0">
    <div class="p-4 flex-grow" v-if="!gw2Token">
      <label class="block text-gray-700 font-bold mb-2" for="gw2TokenEntry">
        GW2 API Key (<a
          href="https://account.arena.net/applications"
          class="text-blue-400 hover:underline"
          >get key</a
        >)
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        v-model="gw2TokenEntry"
        id="gw2TokenEntry"
        type="text"
        placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXXXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
      />
      <router-link
        :to="{ path: gw2TokenEntry }"
        append
        :disabled="!gw2TokenEntry"
        :class="storeButtonClasses"
        >Store GW2 API Key in URL</router-link
      >
    </div>
    <div class="p-4 flex-grow" v-if="gw2Token && !dpsToken">
      <label class="block text-gray-700 font-bold mb-2" for="dpsTokenEntry">
        dps.report User Token (<a
          href="https://dps.report/getUserToken"
          class="text-blue-400 hover:underline"
          >get token</a
        >)
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        v-model="dpsTokenEntry"
        id="dpsTokenEntry"
        type="text"
        placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      />
      <router-link
        :to="{ path: dpsTokenEntry }"
        append
        :disabled="!dpsTokenEntry"
        :class="storeButtonClasses"
        >Store dps.report User Token in URL</router-link
      >
    </div>

    <div
      v-if="statusMessage"
      class="px-4 border-4 border-blue-500 text-blue-500 bg-blue-100 px-16 py-4 text-xl mx-auto mt-4"
    >
      {{ statusMessage }}
    </div>

    <div v-for="wing in raidWings" :key="wing.wing" class="w-full px-4">
      <h2 class="text-3xl mt-8" v-if="wing.kp">{{ wing.name }}</h2>
      <div class="font-mono text-sm text-gray-800" v-if="wing.kp">
        {{ wing.kp }}
      </div>
      <div
        v-for="encounter in wing.encounters"
        :key="encounter.name"
        class="px-4"
      >
        <h3 class="text-2xl mt-4" v-if="encounter.kpCount">
          {{ encounter.name }}
        </h3>
        <div class="font-mono text-sm text-gray-800" v-if="encounter.kpCount">
          {{ encounter.kp }} ({{ encounter.kpCount }})
        </div>
        <div
          v-for="sum in encounter.summaries"
          :key="sum.url"
          class="px-4 pt-4"
        >
          <Summary
            :account="accountName"
            :summary="sum"
            :mechanics="encounter.mechanics"
            :mechanicSums="encounter.mechanicSums"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { encode } from "gw2e-chat-codes";
import Summary from "../components/Summary";
import { wings, summarize } from "../components/raid";

const KP_PER_SUCCESS = 3;
function kpForEncounter(encounter) {
  return encode("item", {
    id: encounter.trophyId,
    quantity: encounter.kpCount,
  });
}

wings.forEach((wing) => {
  wing.encounters.forEach((encounter) => {
    encounter.kpCount = 0;
    encounter.summaries = [];
  });
});

export default {
  name: "RaidSummary",
  components: { Summary },
  data() {
    return {
      raidWings: wings,
      accountName: "",
      gw2TokenEntry: "",
      dpsTokenEntry: "",
      loadedPairs: {},
      loadingReports: false,
      logsToLoadCount: 0,
    };
  },
  computed: {
    gw2Token: function () {
      return this.$route.params["gw2Token"];
    },
    dpsToken: function () {
      return this.$route.params["dpsToken"];
    },
    storeButtonClasses: function () {
      if (this.gw2TokenEntry || this.dpsTokenEntry) {
        return "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-4 block rounded-full";
      } else {
        return "bg-gray-500 text-white font-bold py-2 px-4 mt-4 block rounded-full";
      }
    },
    statusMessage: function () {
      if (this.loadingReports) {
        return "Collecting Reports";
      } else if (this.logsToLoadCount) {
        return `Loading (${this.logsToLoadCount}) logs`;
      } else {
        return "";
      }
    },
  },
  watch: {
    $route() {
      if (this.gw2Token && this.dpsToken) {
        this.loadLogs();
        this.loadUserName();
      }
    },
  },
  created() {
    if (this.gw2Token && this.dpsToken) {
      this.loadLogs();
      this.loadUserName();
    }
  },
  methods: {
    loadLogs: async function () {
      const pair = this.gw2Token + this.dpsToken;
      if (!this.loadedPairs[pair]) {
        this.loadedPairs[pair] = true;
        this.loadingReports = true;
        const response = await axios.get(
          `https://achiever-api.roxtar.co/raid-reports/${this.gw2Token}/${this.dpsToken}`
        );
        this.loadingReports = false;
        for (const log of response.data) {
          // Async load log
          this.logsToLoadCount++;
          this.loadLog(log);

          // Add kp
          const slug = log.split("_")[1];
          for (const wing of this.raidWings) {
            for (const encounter of wing.encounters) {
              if (encounter.slug === slug) {
                encounter.kpCount += KP_PER_SUCCESS;
                encounter.kp = kpForEncounter(encounter);
                wing.kp = wing.encounters
                  .map((encounter) => kpForEncounter(encounter))
                  .join(" ");
              }
            }
          }
        }
      }
    },
    loadUserName: async function () {
      const response = await axios.get(
        `https://api.guildwars2.com/v2/account?access_token=${this.gw2Token}`
      );
      this.accountName = response.data.name;
    },
    loadLog: async function (log) {
      console.log(`Loading log ${log}`);
      // Get the report json and generate summary
      const response = await axios.get(
        `https://dps.report/getJson?permalink=${log}`
      );
      this.logsToLoadCount--;
      const summary = summarize(response.data);
      summary.url = log;

      // Store the summary on the appropriate encounter, sort by duration
      for (const wing of this.raidWings) {
        for (const encounter of wing.encounters) {
          if (encounter.name === summary.fightName) {
            encounter.summaries.push(summary);
            encounter.summaries.sort((a, b) =>
              a.duration.localeCompare(b.duration)
            );
          }
        }
      }
    },
  },
};
</script>
