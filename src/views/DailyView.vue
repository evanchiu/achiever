<template>
  <div class="flex container flex-wrap m-auto mt-0">
    <div class="w-full flex px-2">
      <h1 class="text-xl md:text-3xl flex-initial">
        Daily Wizard's Vault {{ vaultDailyComplete }}
      </h1>
    </div>
    <div v-if="!gw2Token" class="px-8 w-full">
      <label class="block text-gray-700 font-bold mb-2" for="gw2TokenEntry">
        Add GW2 API Key to check daily Wizard's Vault (<a
          href="https://account.arena.net/applications"
          class="text-blue-400 hover:underline"
          >get key</a
        >)
      </label>
      <input
        id="gw2TokenEntry"
        v-model="gw2TokenEntry"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="text"
        placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXXXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
      />
      <div class="w-full block mt-2 text-right">
        <router-link
          :to="'/daily/' + gw2TokenEntry"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold px-8 py-1 rounded-full"
          >Store GW2 API Key in URL</router-link
        >
      </div>
    </div>
    <div v-if="vaultDailyError" class="px-8 w-full">{{ vaultDailyError }}</div>
    <banner-achievement
      v-for="a in vaultDailyAchievements"
      :key="a.id"
      :achievement="a"
    />
    <div class="w-full flex px-2">
      <h1 class="text-xl md:text-3xl flex-initial">Daily Priority Strikes</h1>
    </div>
    <banner-achievement
      v-for="a in strikeAchievements"
      :key="a.id"
      :achievement="a"
    />
    <div class="w-full flex px-2">
      <h1 class="text-xl md:text-3xl flex-initial">Daily Fractals</h1>
    </div>
    <banner-achievement
      v-for="a in dailyFractalAchievements"
      :key="a.id"
      :achievement="a"
    />
    <div class="w-full flex px-2">
      <h1 class="text-xl md:text-3xl flex-initial">Recommended Fractals</h1>
    </div>
    <banner-achievement
      v-for="a in recommendedFractalAchievements"
      :key="a.id"
      :achievement="a"
    />
    <div class="w-full flex px-2">
      <h1 class="text-xl md:text-3xl flex-initial">Weekly Raids</h1>
    </div>
    <div v-if="!gw2Token" class="px-8 w-full">
      <label class="block text-gray-700 font-bold mb-2" for="gw2TokenEntry">
        Add GW2 API Key to check weekly clear progress (<a
          href="https://account.arena.net/applications"
          class="text-blue-400 hover:underline"
          >get key</a
        >)
      </label>
      <input
        id="gw2TokenEntry"
        v-model="gw2TokenEntry"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="text"
        placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXXXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
      />
      <div class="w-full block mt-2 text-right">
        <router-link
          :to="'/daily/' + gw2TokenEntry"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold px-8 py-1 rounded-full"
          >Store GW2 API Key in URL</router-link
        >
      </div>
    </div>
    <div v-if="gw2Token && !dpsToken" class="px-8 flex-grow">
      <label class="block text-gray-700 font-bold mb-2" for="dpsTokenEntry">
        Add dps.report User Token to fake kp (<a
          href="https://dps.report/getUserToken"
          class="text-blue-400 hover:underline"
          >get token</a
        >)
      </label>
      <input
        id="dpsTokenEntry"
        v-model="dpsTokenEntry"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="text"
        placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      />
      <div class="w-full block mt-2 text-right">
        <router-link
          :to="append($route.path, dpsTokenEntry)"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold px-8 py-1 rounded-full"
          >Store dps.report User Token in URL</router-link
        >
      </div>
    </div>
    <div v-if="gw2Token" class="w-full flex flex-wrap">
      <banner-achievement
        v-for="a in raidAchievements"
        :key="a.id"
        :achievement="a"
      />
    </div>
    <div class="w-full flex px-2">
      <h1 class="text-xl md:text-3xl flex-initial">
        Weekly Wizard's Vault {{ vaultWeeklyComplete }}
      </h1>
    </div>
    <div v-if="vaultWeeklyError" class="px-8 w-full">
      {{ vaultWeeklyError }}
    </div>
    <banner-achievement
      v-for="a in vaultWeeklyAchievements"
      :key="a.id"
      :achievement="a"
    />
  </div>
</template>

<script>
import BannerAchievement from "../components/BannerAchievement.vue";
import axios from "axios";
import {
  callOfTheMistsWingIndex,
  emboldenedWingIndex,
  latestReset,
  wings,
} from "../components/raid";
import { encode } from "gw2e-chat-codes";
import { getStrike } from "../components/strike";
import { getFractals } from "../components/fractal";

const KP_PER_SUCCESS = 4;

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
  name: "DailyView",
  components: {
    BannerAchievement,
  },
  data() {
    return {
      allAchievements: [],
      dailyFractalAchievements: [],
      recommendedFractalAchievements: [],
      strikeAchievements: [],
      vaultDailyAchievements: [],
      vaultDailyError: "",
      vaultDailyComplete: "",
      vaultWeeklyAchievements: [],
      vaultWeeklyError: "",
      vaultWeeklyComplete: "",
      shownModes: ["pve", "pvp", "wvw"],
      sortType: "time",
      level: 80,
      products: {
        HeartOfThorns: "HasAccess",
        PathOfFire: "HasAccess",
      },
      weeklyClears: [],
      kpPerEncounter: {},
      gw2TokenEntry: "",
      dpsTokenEntry: "",
    };
  },
  computed: {
    gw2Token: function () {
      return this.$route.params["gw2Token"];
    },
    dpsToken: function () {
      return this.$route.params["dpsToken"];
    },
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
                  a.required_access.condition),
          )
          .sort(sorts[this.sortType]);
      } else {
        return [];
      }
    },
    raidAchievements: function () {
      const cotmIndex = callOfTheMistsWingIndex();
      const emboldenedIndex = emboldenedWingIndex();
      return wings.map((wing, wingIndex) => {
        const encounters = wing.encounters.map((encounter, index) => {
          return {
            id: index,
            name: encounter.name,
            cleared: this.weeklyClears.includes(encounter.id),
            kpCount: this.kpPerEncounter[encounter.slug],
            kpCode: encode("item", {
              id: encounter.trophyId,
              quantity: this.kpPerEncounter[encounter.slug],
            }),
          };
        });
        return {
          id: wing.wing,
          icon: "https://render.guildwars2.com/file/9F5C23543CB8C715B7022635C10AA6D5011E74B3/1302679.png",
          mode: "raid",
          name: `W${wing.wing}: ${wing.name}`,
          callOfTheMists: wingIndex === cotmIndex || wing.wing === 8,
          emboldened: wingIndex === emboldenedIndex || wing.wing === 8,
          encounters,
        };
      });
    },
  },
  watch: {
    gw2Token: function () {
      if (this.gw2Token) {
        this.loadWeeklyClears();
      }
    },
    dpsToken: function () {
      if (this.dpsToken) {
        this.loadKp();
      }
    },
  },
  created() {
    const that = this;
    this.loadDailies();
    if (this.gw2Token) {
      this.loadWeeklyClears();
      this.loadVault();
      setInterval(() => {
        that.loadWeeklyClears();
        that.loadVault();
      }, 1000 * 60);
    }
    if (this.dpsToken) {
      this.loadKp();
      setInterval(
        () => {
          that.loadKp();
        },
        1000 * 60 * 10,
      );
    }
  },
  methods: {
    loadDailies: async function () {
      const strike = getStrike();
      this.strikeAchievements = [
        {
          name: strike.ibs,
          icon: "https://render.guildwars2.com/file/483E3939D1A7010BDEA2970FB27703CAAD5FBB0F/42684.png",
          mode: "strike",
          criterion: "Icebrood Saga Priority Strike",
        },
        {
          name: strike.eod,
          icon: "https://render.guildwars2.com/file/483E3939D1A7010BDEA2970FB27703CAAD5FBB0F/42684.png",
          mode: "strike",
          criterion: "End of Dragons Priority Strike",
        },
        {
          name: strike.soto,
          icon: "https://render.guildwars2.com/file/483E3939D1A7010BDEA2970FB27703CAAD5FBB0F/42684.png",
          mode: "strike",
          criterion: "Secrets of the Obscure Priority Strike",
        },
      ];
      const fractals = getFractals();
      this.dailyFractalAchievements = fractals.daily
        .sort((a, b) => Math.max(...b.scales) - Math.max(...a.scales))
        .map((a) => {
          return {
            name: a.name,
            icon: "https://render.guildwars2.com/file/A442B13E7B0D4A2F7136702FA858EA0C9F0CE4B3/1228223.png",
            mode: "fractals",
            criterion: a.scales.reverse().join(", "),
          };
        });
      this.recommendedFractalAchievements = fractals.recommended
        .sort((a, b) => b.scale - a.scale)
        .map((a) => {
          return {
            name: a.name,
            icon: "https://render.guildwars2.com/file/4A5834E40CDC6A0C44085B1F697565002D71CD47/1228226.png",
            mode: "fractals",
            criterion: a.scale,
          };
        });
    },
    loadVault: async function () {
      // fetch account data and vault data
      const [accountResponse, vaultDailyResponse, vaultWeeklyResponse] =
        await Promise.all([
          axios.get(`https://api.guildwars2.com/v2/account`, {
            params: {
              v: "2019-02-21T00:00:00Z",
              access_token: this.gw2Token,
              time: new Date().getTime(),
            },
          }),
          axios.get(
            `https://api.guildwars2.com/v2/account/wizardsvault/daily`,
            {
              params: {
                access_token: this.gw2Token,
                time: new Date().getTime(),
              },
            },
          ),
          axios.get(
            `https://api.guildwars2.com/v2/account/wizardsvault/weekly`,
            {
              params: {
                access_token: this.gw2Token,
                time: new Date().getTime(),
              },
            },
          ),
        ]);

      // Check for and set vaultDailyError if the player hasn't logged in yet today
      const dailyReset = new Date();
      dailyReset.setUTCHours(0);
      const weeklyReset = latestReset();
      const apiModified = new Date(accountResponse.data.last_modified);
      if (apiModified < dailyReset) {
        this.vaultDailyError =
          "Vault achievements aren't visible for a few minutes after your first login today";
      } else {
        this.vaultDailyAchievements = vaultDailyResponse.data.objectives.map(
          (objective) => {
            const claimedEmoji = objective.claimed ? "✅" : "❌";
            const criterion = `${claimedEmoji}: ${objective.progress_current}/${objective.progress_complete}`;
            return {
              name: objective.title,
              icon: "https://render.guildwars2.com/file/483E3939D1A7010BDEA2970FB27703CAAD5FBB0F/42684.png",
              mode: objective.track.toLocaleLowerCase(),
              criterion,
            };
          },
        );
        this.vaultDailyComplete = vaultDailyResponse.data.meta_reward_claimed
          ? "✅"
          : "❌";
      }

      if (apiModified < weeklyReset) {
        this.vaultWeeklyError =
          "Vault weekly achievements aren't visible for a few minutes after your first login after weekly reset";
      } else {
        this.vaultWeeklyAchievements = vaultWeeklyResponse.data.objectives.map(
          (objective) => {
            const claimedEmoji = objective.claimed ? "✅" : "❌";
            const criterion = `${claimedEmoji}: ${objective.progress_current}/${objective.progress_complete}`;
            return {
              name: objective.title,
              icon: "https://render.guildwars2.com/file/483E3939D1A7010BDEA2970FB27703CAAD5FBB0F/42684.png",
              mode: objective.track.toLocaleLowerCase(),
              criterion,
            };
          },
        );
        this.vaultWeeklyComplete = vaultWeeklyResponse.data.meta_reward_claimed
          ? "✅"
          : "❌";
      }
    },
    loadWeeklyClears: async function () {
      // Get weekly clears from GW2 API https://wiki.guildwars2.com/wiki/API:2/account/raids
      try {
        // fetch account data and raid data
        const [accountResponse, raidResponse] = await Promise.all([
          axios.get(`https://api.guildwars2.com/v2/account`, {
            params: {
              v: "2019-02-21T00:00:00Z",
              access_token: this.gw2Token,
              time: new Date().getTime(),
            },
          }),
          axios.get(`https://api.guildwars2.com/v2/account/raids`, {
            params: {
              access_token: this.gw2Token,
              time: new Date().getTime(),
            },
          }),
        ]);

        // If raid reset has passed since the last time the api data was modified,
        // no raids have been cleared this week
        const raidReset = latestReset();
        const apiModified = new Date(accountResponse.data.last_modified);
        if (raidReset > apiModified) {
          this.weeklyClears = [];
        } else {
          this.weeklyClears = raidResponse.data;
        }
      } catch (e) {
        throw new Error("Error reading from GW2 API", { cause: e });
      }
    },
    loadKp: async function () {
      // Load clear logs through the Achiever API
      try {
        const response = await axios.get(
          `https://achiever-api.roxtar.co/raid-reports/${this.gw2Token}/${this.dpsToken}`,
        );
        const kpPerEncounter = {};
        for (const log of response.data) {
          // Add kp
          const slug = log.split("_")[1];
          if (!kpPerEncounter[slug]) {
            kpPerEncounter[slug] = KP_PER_SUCCESS;
          } else {
            kpPerEncounter[slug] += KP_PER_SUCCESS;
            if (kpPerEncounter[slug] > 250) {
              kpPerEncounter[slug] = 250;
            }
          }
        }
        this.kpPerEncounter = kpPerEncounter;
      } catch (e) {
        throw new Error("Error reading from Achiever API", { cause: e });
      }
    },
  },
};
</script>
