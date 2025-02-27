<template>
  <div class="flex container flex-wrap m-auto mt-0">
    <div v-if="!gw2Token" class="px-8 w-full">
      <label class="block text-gray-700 font-bold mb-2" for="gw2TokenEntry">
        Add GW2 API Key to check wallet/inventory (<a
          href="https://account.arena.net/applications"
          class="text-blue-400 hover:underline"
          >get key</a
        >)
      </label>
      <input
        id="gw2TokenEntry"
        v-model="gw2TokenEntry"
        class="shadow-sm appearance-none border rounded-sm w-full py-2 px-3 text-gray-700 leading-tight focus:outline-hidden focus:shadow-outline"
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
    <div
      v-if="loading"
      class="w-full p-4 m-4 bg-purple-200 text-purple-600 border-purple-600 rounded-lg text-xl content-center"
    >
      ...loading...
    </div>
    <div v-if="accountName" class="w-full flex-down px-2">
      <h1 class="text-xl md:text-3xl flex-initial w-full">{{ accountName }}</h1>
      <h1 class="text-xl md:text-2xl flex-initial w-full mt-2">
        {{ potentialImperialFavors }} Potential Imperial Favors
      </h1>
      <ul class="w-full pl-4">
        <li class="text-gray-600">{{ imperialFavors }} Imperial Favors</li>
        <li v-for="writId in WRIT_IDS" :key="writId">
          <inventory-item :item="items[writId]"></inventory-item>
        </li>
      </ul>
      <h1 class="text-xl md:text-2xl flex-initial w-full mt-2">
        {{ potentialMysticClovers }} Potential Mystic Clovers
      </h1>
      <ul class="w-full pl-4">
        <li v-for="mysticId in MYSTIC_ITEM_IDS" :key="mysticId">
          <inventory-item :item="items[mysticId]"></inventory-item>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import InventoryItem from "../components/InventoryItem.vue";

const FAVOR_WALLET_ID = 68;
const WRIT_IDS = [96680, 96533, 96561, 95692];
const MYSTIC_CLOVER_ID = 19675;
const CHEST_OF_LOYALTY_ID = 68326;
const CHEST_OF_LEGENDARY_CRAFTING_ID = 68352;
const MYSTIC_ITEM_IDS = [
  MYSTIC_CLOVER_ID,
  CHEST_OF_LOYALTY_ID,
  CHEST_OF_LEGENDARY_CRAFTING_ID,
];
const ITEM_IDS = [...WRIT_IDS, ...MYSTIC_ITEM_IDS];

export default {
  name: "WalletView",
  components: { InventoryItem },
  data() {
    return {
      gw2TokenEntry: "",
      accountName: "",
      items: {},
      imperialFavors: 0,
      loading: true,
      MYSTIC_ITEM_IDS: MYSTIC_ITEM_IDS,
      WRIT_IDS: WRIT_IDS,
      potentialImperialFavors: 0,
      potentialMysticClovers: 0,
    };
  },
  computed: {
    gw2Token: function () {
      return this.$route.params["gw2Token"];
    },
  },
  watch: {
    gw2Token: function () {
      this.loadAll();
    },
  },
  created() {
    if (this.gw2Token) {
      this.loadAll();
    }
  },
  methods: {
    loadAll: async function () {
      this.loading = true;
      ITEM_IDS.forEach((itemId) => {
        this.items[itemId] = { total: 0, counts: {} };
      });
      await Promise.all([
        this.loadItemData(),
        this.loadAccountName(),
        this.loadWallet(),
        this.loadSharedInventory(),
        this.loadMaterials(),
        this.loadBank(),
        this.loadCharacterInventory(),
      ]);
      const items = this.items;
      const writCount = WRIT_IDS.map((writId) => items[writId]).reduce(
        (sum, item) => sum + item.total,
        0,
      );
      this.potentialImperialFavors = this.imperialFavors + writCount * 5;
      this.potentialMysticClovers =
        this.items[MYSTIC_CLOVER_ID].total +
        this.items[CHEST_OF_LOYALTY_ID].total * 7 +
        this.items[CHEST_OF_LEGENDARY_CRAFTING_ID].total * 7;
      this.loading = false;
    },
    loadAccountName: async function () {
      this.accountName = (
        await axios.get(
          `https://api.guildwars2.com/v2/account?v=2019-02-21T00:00:00Z&access_token=${this.gw2Token}`,
        )
      ).data.name;
    },
    loadWallet: async function () {
      const walletResponse = await axios.get(
        `https://api.guildwars2.com/v2/account/wallet?access_token=${this.gw2Token}`,
      );
      // Set values from wallet
      const walletFavors = walletResponse.data.find(
        (entry) => entry.id === FAVOR_WALLET_ID,
      );
      if (walletFavors) {
        this.imperialFavors = walletFavors.value;
      }
    },
    loadSharedInventory: async function () {
      const sharedInventoryResponse = await axios.get(
        `https://api.guildwars2.com/v2/account/inventory?access_token=${this.gw2Token}`,
      );
      this.catalogInventory(sharedInventoryResponse.data, "shared inventory");
    },
    loadMaterials: async function () {
      const materialsResponse = await axios.get(
        `https://api.guildwars2.com/v2/account/materials?access_token=${this.gw2Token}`,
      );
      this.catalogInventory(materialsResponse.data, "bank materials");
    },
    loadBank: async function () {
      const bankResponse = await axios.get(
        `https://api.guildwars2.com/v2/account/bank?access_token=${this.gw2Token}`,
      );
      this.catalogInventory(bankResponse.data, "bank");
    },
    loadCharacterInventory: async function () {
      const charactersNamesResponse = await axios.get(
        `https://api.guildwars2.com/v2/characters?access_token=${this.gw2Token}`,
      );
      await Promise.all(
        charactersNamesResponse.data.map(async (name) => {
          const uriName = encodeURIComponent(name);
          const characterInventoryResponse = await axios.get(
            `https://api.guildwars2.com/v2/characters/${uriName}/inventory?access_token=${this.gw2Token}`,
          );
          characterInventoryResponse.data.bags.forEach((bag) => {
            if (!bag || !bag.inventory) {
              return;
            }
            this.catalogInventory(bag.inventory, name);
          });
        }),
      );
    },
    loadItemData: async function () {
      const itemResponse = await axios.get(
        `https://api.guildwars2.com/v2/items?ids=${ITEM_IDS.join(",")}&lang=en`,
      );
      itemResponse.data.forEach((item) => {
        if (!this.items[item.id]) {
          this.items[item.id] = { counts: {} };
        }
        this.items[item.id].name = item.name;
      });
    },
    catalogInventory: async function (inventory, sourceName) {
      inventory
        .filter((item) => item != null && ITEM_IDS.includes(item.id))
        .forEach((item) => {
          // Skip cataloging if there are none
          if (item.count == 0) {
            return;
          }
          // Add in count
          if (this.items[item.id].counts[sourceName]) {
            this.items[item.id].counts[sourceName] += item.count;
          } else {
            this.items[item.id].counts[sourceName] = item.count;
          }
          // Update total for this item
          this.items[item.id].total = Object.keys(
            this.items[item.id].counts,
          ).reduce((sum, source) => {
            return sum + this.items[item.id].counts[source];
          }, 0);
        });
    },
  },
};
</script>
