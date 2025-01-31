<template>
  <div class="flex container flex-wrap m-auto mt-0">
    <div
      v-for="account in accounts"
      :key="account.token"
      class="w-full px-2 pb-4"
    >
      <h2 class="text-xl md:text-2xl w-full">
        {{ account.primaryCharacterName }}
        <span class="text-lg text-gray-700">({{ account.name }})</span>
      </h2>
      <p class="w-full text-xs text-gray-400">
        {{ account.token }} - Last Active: {{ account.lastActive }}
      </p>
      <p class="w-full text-xs">{{ account.dailyVaultString }}</p>
      <p class="w-full text-xs">{{ account.weeklyVaultString }}</p>
      <p class="w-full text-xs">{{ account.raidString }}</p>
      <p class="w-full text-xs">{{ account.specialVaultString }}</p>
    </div>
  </div>
</template>

<script>
const vaultDb = require("../components/vault-db.json");
import axios from "axios";
import { latestReset, wings } from "../components/raid";

async function loadAccount(token, index, that) {
  const accountResponse = await axios.get(
    `https://api.guildwars2.com/v2/account`,
    {
      params: {
        v: "2019-02-21T00:00:00Z",
        access_token: token,
        time: new Date().getTime(),
      },
    },
  );
  that.accounts[index].accountData = accountResponse.data;
  that.accounts[index].lastActive = new Date(
    accountResponse.data.last_modified,
  );
  that.accounts[index].name = accountResponse.data.name;
}

async function loadPrimary(token, index, that) {
  const charactersNamesResponse = await axios.get(
    `https://api.guildwars2.com/v2/characters?access_token=${token}`,
  );
  const characters = await Promise.all(
    charactersNamesResponse.data.map(async (name) => {
      const uriName = encodeURIComponent(name);
      const characterResponse = await axios.get(
        `https://api.guildwars2.com/v2/characters/${uriName}/core?access_token=${token}`,
      );
      return characterResponse.data;
    }),
  );
  that.accounts[index].characters = characters;
  // Sort by age desending
  characters.sort((a, b) => b.age - a.age);
  that.accounts[index].primaryCharacterName = characters[0].name;
}

async function loadDailyVault(token, index, that, apiModified) {
  const dailyReset = new Date();
  dailyReset.setUTCHours(0);
  loadVault(
    token,
    index,
    that,
    apiModified,
    "daily",
    "Daily",
    dailyReset,
    "today",
    "dailyVaultString",
  );
}

async function loadWeeklyVault(token, index, that, apiModified) {
  const weeklyReset = latestReset();
  loadVault(
    token,
    index,
    that,
    apiModified,
    "weekly",
    "Weekly",
    weeklyReset,
    "this week",
    "weeklyVaultString",
  );
}

async function loadSpecialVault(token, index, that, apiModified) {
  const specialReset = new Date(0);
  loadVault(
    token,
    index,
    that,
    apiModified,
    "special",
    "Special",
    specialReset,
    "this season",
    "specialVaultString",
  );
}

async function loadVault(
  token,
  index,
  that,
  apiModified,
  urlSlug,
  name,
  reset,
  firstLoginWhen,
  stringName,
) {
  if (apiModified < reset) {
    that.accounts[index][stringName] =
      `${name} Vault achievements aren't visible for a few minutes after your first login ${firstLoginWhen}`;
  } else {
    const response = await axios.get(
      `https://api.guildwars2.com/v2/account/wizardsvault/${urlSlug}`,
      {
        params: {
          access_token: token,
          time: new Date().getTime(),
        },
      },
    );
    const detailString = response.data.objectives
      .map((objective) => {
        const claimedEmoji = objective.claimed ? "✅" : "❌";
        const descrption = vaultDb[objective.id]?.succinct || objective.title;
        return `${claimedEmoji} ${objective.progress_current}/${objective.progress_complete} ${descrption}`;
      })
      .join(", ");
    let completeEmoji = "";
    if (response.data.meta_reward_claimed === true) {
      completeEmoji = "✅ ";
    } else if (response.data.meta_reward_claimed === false) {
      completeEmoji = "❌ ";
    }

    that.accounts[index][stringName] =
      `${completeEmoji} ${name} Vault - ${detailString}`;
  }
}

function getInitials(str) {
  const words = str.split(" "); // Split the string into words
  const initials = words.map((word) => word.charAt(0)).join(""); // Extract first character of each word and join them
  return initials; // Return initials in uppercase (optional)
}

async function loadRaids(token, index, that, apiModified) {
  let weeklyClears = [];
  const weeklyReset = latestReset();
  if (apiModified > weeklyReset) {
    const response = await axios.get(
      `https://api.guildwars2.com/v2/account/raids`,
      {
        params: {
          access_token: token,
          time: new Date().getTime(),
        },
      },
    );
    weeklyClears = response.data;
  }
  that.accounts[index].raidString = wings
    .map((wing) => {
      const encounters = wing.encounters.map((encounter) => {
        const clearedEmoji = weeklyClears.includes(encounter.id) ? "✅" : "⚪️";
        return `${clearedEmoji}${getInitials(encounter.name)}`;
      });
      return `W${wing.wing}: ${encounters.join(", ")}`;
    })
    .join("; ");
}

export default {
  name: "MultiView",
  data() {
    return {
      accounts: [],
      tokenEntry: "",
    };
  },
  computed: {
    tokens: function () {
      return this.$route.params["token"];
    },
  },
  watch: {
    tokens: function () {
      if (this.tokens) {
        console.log("tokens", tokens);
      }
    },
  },
  created() {
    const that = this;
    this.tokens.map(async (token, index) => {
      const account = { token };
      that.accounts[index] = account;
      loadPrimary(token, index, that);
      await loadAccount(token, index, that);
      const apiModified = new Date(account.accountData.last_modified);
      loadDailyVault(token, index, that, apiModified);
      loadWeeklyVault(token, index, that, apiModified);
      loadSpecialVault(token, index, that, apiModified);
      loadRaids(token, index, that, apiModified);
      setInterval(
        async () => {
          await loadAccount(token, index, that);
          const apiModified = new Date(account.accountData.last_modified);
          loadDailyVault(token, index, that, apiModified);
          loadWeeklyVault(token, index, that, apiModified);
          loadSpecialVault(token, index, that, apiModified);
          loadRaids(token, index, that, apiModified);
        },
        1000 * 60 * 5,
      );
    });
  },
};
</script>
