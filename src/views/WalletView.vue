<template>
  <div class="flex container flex-wrap m-auto mt-0">
    <div class="px-8 w-full" v-if="!gw2Token">
      <label class="block text-gray-700 font-bold mb-2" for="gw2TokenEntry">
        Add GW2 API Key to check wallet/inventory (<a
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
      <div class="w-full block mt-2 text-right">
        <router-link
          :to="append($route.path, gw2TokenEntry)"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold px-8 py-1 rounded-full"
          >Store GW2 API Key in URL</router-link
        >
      </div>
    </div>
    <div class="w-full flex-down px-2" v-if="accountName">
      <h1 class="text-xl md:text-3xl flex-initial w-full">{{ accountName }}</h1>
      <h1 class="text-xl md:text-2xl flex-initial w-full">
        {{ totalPotential }} Potential Imperial Favors
      </h1>
      <ul class="w-full">
        <li>{{ imperialFavors }} Imperial Favors</li>
        <li v-for="writ in Object.values(writs)" :key="writ.id">
          {{ writ.count }} {{ writ.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from "axios";

const FAVOR_WALLET_ID = 68;
const WRIT_IDS = [96680, 96533, 96561, 95692];

export default {
  name: "WalletView",
  data() {
    return {
      gw2TokenEntry: "",
      imperialFavors: 0,
      accountName: "",
      writs: {},
      totalPotential: 0,
    };
  },
  computed: {
    gw2Token: function () {
      return this.$route.params["gw2Token"];
    },
  },
  watch: {
    gw2Token: function () {
      this.loadWallet();
    },
  },
  created() {
    if (this.gw2Token) {
      this.loadWallet();
    }
  },
  methods: {
    loadWallet: async function () {
      try {
        // fetch account details, wallet, shared inventory, materials, characters
        const [
          accountResponse,
          walletResponse,
          sharedInventoryResponse,
          materialsResponse,
          writItemResponse,
        ] = await Promise.all([
          axios.get(
            `https://api.guildwars2.com/v2/account?v=2019-02-21T00:00:00Z&access_token=${this.gw2Token}`
          ),
          axios.get(
            `https://api.guildwars2.com/v2/account/wallet?access_token=${this.gw2Token}`
          ),
          axios.get(
            `https://api.guildwars2.com/v2/account/inventory?access_token=${this.gw2Token}`
          ),
          axios.get(
            `https://api.guildwars2.com/v2/account/materials?access_token=${this.gw2Token}`
          ),
          axios.get(
            `https://api.guildwars2.com/v2/items?ids=${WRIT_IDS.join(
              ","
            )}&lang=en`
          ),
        ]);

        this.accountName = accountResponse.data.name;
        this.imperialFavors = walletResponse.data.find(
          (entry) => entry.id === FAVOR_WALLET_ID
        ).value;
        WRIT_IDS.forEach((writId) => {
          this.writs[writId] = writItemResponse.data.find(
            (entry) => entry.id === writId
          );
          this.writs[writId].count = 0;
        });
        materialsResponse.data
          .filter((item) => item != null)
          .filter((item) => WRIT_IDS.includes(item.id))
          .forEach((item) => {
            this.writs[item.id].count += item.count;
          });
        sharedInventoryResponse.data
          .filter((item) => item != null)
          .filter((item) => WRIT_IDS.includes(item.id))
          .forEach((item) => {
            this.writs[item.id].count += item.count;
          });
        const writCount = Object.values(this.writs).reduce(
          (sum, item) => sum + item.count,
          0
        );
        this.totalPotential = this.imperialFavors + writCount * 5;
      } catch (e) {
        throw new Error("Error reading from GW2 API", { cause: e });
      }
    },
  },
};
</script>
