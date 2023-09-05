const msPerDay = 1000 * 60 * 60 * 24;
const fractalDb = require("./fractal-db.json");

// Strike is based on modulus of days since baseline
const STRIKE_BASELINE_DATE = new Date("2023/08/29 00:00 UTC");

const DAILY_FRACTALS = [
  ["Nightmare", "Snowblind", "Volcanic"],
  ["Aetherblade", "Thaumanova Reactor", "Uncategorized"],
  ["Chaos", "Cliffside", "Twilight Oasis"],
  ["Captain Mai Trin Boss", "Deepstone", "Silent Surf"],
  ["Nightmare", "Snowblind", "Solid Ocean"],
  ["Chaos", "Uncategorized", "Urban Battleground"],
  ["Deepstone", "Molten Furnace", "Siren's Reef"],
  ["Molten Boss", "Twilight Oasis", "Underground Facility"],
  ["Silent Surf", "Swampland", "Volcanic"],
  ["Aquatic Ruins", "Snowblind", "Thaumanova Reactor"],
  ["Sunqua Peak", "Underground Facility", "Urban Battleground"],
  ["Aetherblade", "Chaos", "Nightmare"],
  ["Cliffside", "Molten Boss", "Siren's Reef"],
  ["Deepstone", "Solid Ocean", "Swampland"],
  ["Captain Mai Trin Boss", "Molten Boss", "Shattered Observatory"],
];

const RECOMMENDED_FRACTALS = [
  { Uncategorized: 2, "Siren's Reef": 37, "Underground Facility": 53 },
  { Cliffside: 6, Volcanic: 28, "Aquatic Ruins": 61 },
  { "Molten Boss": 10, Swampland: 32, Aetherblade: 65 },
  { Aetherblade: 14, "Thaumanova Reactor": 34, "Sunqua Peak": 74 },
  { Volcanic: 19, "Siren's Reef": 37, "Urban Battleground": 66 },
  { "Thaumanova Reactor": 15, "Twilight Oasis": 41, "Solid Ocean": 60 },
  { "Sunqua Peak": 24, "Solid Ocean": 35, "Silent Surf": 75 },
  { "Silent Surf": 25, Uncategorized: 36, "Molten Boss": 69 },
  { "Siren's Reef": 12, "Molten Boss": 40, Deepstone: 67 },
  { "Underground Facility": 8, "Urban Battleground": 31, "Siren's Reef": 54 },
  { Deepstone: 11, "Molten Furnace": 39, "Twilight Oasis": 59 },
  { "Captain Mai Trin Boss": 18, Snowblind: 27, "Thaumanova Reactor": 64 },
  { "Urban Battleground": 4, Chaos: 30, "Molten Furnace": 58 },
  { "Twilight Oasis": 16, "Captain Mai Trin Boss": 42, Uncategorized: 62 },
  { Swampland: 5, Nightmare: 47, Cliffside: 68 },
];

/**
 * Calculate the day's fractals
 */
function getFractals() {
  let referenceDate = new Date();
  return getFractalsForDate(referenceDate);
}

function getFractalsForDate(referenceDate) {
  const msSinceStrikeBaseline =
    referenceDate.getTime() - STRIKE_BASELINE_DATE.getTime();
  const daysSinceBaseline = Math.floor(msSinceStrikeBaseline / msPerDay);

  const dailySet = DAILY_FRACTALS[daysSinceBaseline % DAILY_FRACTALS.length];
  const daily = dailySet.map((name) => {
    const scales = fractalDb
      .filter((fractal) => fractal.fractal === name)
      .map((fractal) => fractal.level);
    return {
      name,
      scales,
    };
  });

  const recommendedSet =
    RECOMMENDED_FRACTALS[daysSinceBaseline % RECOMMENDED_FRACTALS.length];
  const recommended = Object.keys(recommendedSet).map((name) => {
    return {
      name: name,
      scale: recommendedSet[name],
    };
  });

  return {
    daily,
    recommended,
  };
}

module.exports = {
  getFractals,
  getFractalsForDate,
};
