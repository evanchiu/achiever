<template>
  <div :class="classes">
    <p class="text-red-800" v-if="discardReason">{{ discardReason }}</p>
    <p>
      {{ cmText }} {{ summaryText }} on {{ summary.start }} in
      {{ summary.duration }}
      <a :href="summary.url" class="text-blue-400">log</a>
    </p>
    <div v-if="player && !discardReason" class="px-4">
      <p>{{ commanderText }} {{ player.name }}, {{ player.profession }}:</p>
      <ul>
        <li>
          Target: {{ player.targetDps.dps }} dps ({{
            ((player.targetDps.dps * 100) / summary.squad.targetDps).toFixed(1)
          }}% of squad) ({{ player.targetDps.powerDps }} power +
          {{ player.targetDps.condiDps }} condi),
          {{ player.targetDps.breakbarDamage }} breakbar ({{
            (
              (player.targetDps.breakbarDamage * 100) /
              summary.squad.targetBreakbar
            ).toFixed(1)
          }}% of squad)
        </li>
        <li>
          All: {{ player.allDps.dps }} dps ({{
            ((player.allDps.dps * 100) / summary.squad.allDps).toFixed(1)
          }}% of squad) ({{ player.allDps.powerDps }} power +
          {{ player.allDps.condiDps }} condi),
          {{ player.allDps.breakbarDamage }} breakbar ({{
            (
              (player.allDps.breakbarDamage * 100) /
              summary.squad.allBreakbar
            ).toFixed(1)
          }}% of squad)
        </li>
        <li>
          {{ player.downs }} downs <span>[Max 2]</span> ({{
            summary.squad.downs
          }}
          squad downs)
        </li>
        <li>
          {{ player.deaths }} deaths <span>[Max 0]</span> ({{
            summary.squad.deaths
          }}
          squad deaths)
        </li>
        <li v-for="mechanic in shownMechanics" :key="mechanic.name">
          {{ player[mechanic.name] }} {{ mechanic.name }}
          <span v-if="mechanic.hasOwnProperty('max')"
            >[Max {{ mechanic.max }}]</span
          >
          <span v-if="mechanic.hasOwnProperty('min')"
            >[Min {{ mechanic.max }}]</span
          >
          <span v-if="mechanic.custom">[{{ mechanic.custom }}]</span>
        </li>
        <li
          v-for="mechanicSum in calculatedMechanicSums"
          :key="mechanicSum.name"
        >
          {{ mechanicSum.sum }} {{ mechanicSum.name }}
          <span v-if="mechanicSum.hasOwnProperty('max')"
            >[Max {{ mechanicSum.max }}]</span
          >
          <span v-if="mechanicSum.hasOwnProperty('min')"
            >[Min {{ mechanicSum.min }}]</span
          >
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import compareVersions from "compare-versions";

export default {
  props: {
    account: String,
    summary: Object,
    mechanics: Array,
    mechanicSums: Array,
  },
  computed: {
    player: function () {
      const accountName = this.account;
      return this.summary.players.find(
        (player) => player.account === accountName
      );
    },
    cmText: function () {
      return this.summary.isCM ? "CM" : "";
    },
    summaryText: function () {
      return this.summary.success ? "Success" : "Failure";
    },
    commanderText: function () {
      if (this.player && this.player.hasCommanderTag) {
        return "Commander";
      } else {
        return "";
      }
    },
    shownMechanics: function () {
      if (!Array.isArray(this.mechanics)) {
        return [];
      }
      if (!Array.isArray(this.mechanicSums)) {
        return this.mechanics;
      }
      return this.mechanics.filter(
        (mechanic) => !this.calculatedMechanicNames.includes(mechanic.name)
      );
    },
    calculatedMechanicNames: function () {
      if (!Array.isArray(this.mechanicSums)) {
        return [];
      }
      return this.mechanicSums.flatMap((mechanicSum) => mechanicSum.mechanics);
    },
    calculatedMechanicSums: function () {
      if (!Array.isArray(this.mechanicSums)) {
        return [];
      }

      return this.mechanicSums.map((mechanicSum) => {
        const sum = mechanicSum.mechanics.reduce((sum, mechanicName) => {
          return sum + this.player[mechanicName];
        }, 0);
        const name = "(" + mechanicSum.mechanics.join(" + ") + ")";
        return Object.assign(mechanicSum, { sum, name });
      });
    },
    discardReason: function () {
      const expiredDate = new Date();
      expiredDate.setMonth(expiredDate.getMonth() - 4);
      // Discard the run for mechanics failures
      if (!this.player) {
        return `${this.account} did not participate`;
      } else if (!this.summary.success) {
        return "Wipe";
      } else if (this.player.deaths > 0) {
        return "Player died";
      } else if (this.player.downs > 2) {
        return "Player downed too many times";
      } else if (this.summary.start < expiredDate) {
        return "Log is more than 4 months old";
      } else if (
        this.summary.start > new Date("May 11, 2021") &&
        this.summary.start < new Date("June 8, 2021")
      ) {
        return "Ineligible log period post May 11 patch";
      } else if (
        this.summary.start > new Date("June 8, 2021") &&
        compareVersions(this.summary.eliteInsightsVersion, "2.34.2.0") < 0
      ) {
        return "Logs after June 8 must be parsed with Elite Insights 2.34.2.0 or later";
      }
      for (const mechanic of this.mechanics) {
        if (
          Object.prototype.hasOwnProperty.call(mechanic, "max") &&
          this.player[mechanic.name] > mechanic.max
        ) {
          return `Too many ${mechanic.name}`;
        } else if (
          Object.prototype.hasOwnProperty.call(mechanic, "min") &&
          this.player[mechanic.name] < mechanic.min
        ) {
          return `Too few ${mechanic.name}`;
        }
      }
      for (const mechanicSum of this.calculatedMechanicSums) {
        if (
          Object.prototype.hasOwnProperty.call(mechanicSum, "max") &&
          mechanicSum.sum > mechanicSum.max
        ) {
          return `Too many ${mechanicSum.name}`;
        } else if (
          Object.prototype.hasOwnProperty.call(mechanicSum, "min") &&
          mechanicSum.sum < mechanicSum.min
        ) {
          return `Too few ${mechanicSum.name}`;
        }
      }
      return "";
    },
    classes: function () {
      const classes = [];
      if (this.discardReason) {
        classes.push("text-red-400");
      }
      return classes;
    },
  },
  created: function () {
    console.log(
      `Created summary display for ${this.account} on ${this.summary.fightName}`
    );
  },
};
</script>
