const msPerDay = 1000 * 60 * 60 * 24;

// Strike is based on modulus of days since baseline
const STRIKE_BASELINE_DATE = new Date("2022/02/27 00:00 UTC");

const IBS_STRIKES = [
  "Boneskinner",
  "Cold War",
  "Fraenir of Jormag",
  "Shiverpeaks Pass",
  "Voice of the Fallen and Claw of the Fallen",
  "Whisper of Jormag",
];

const EOD_STRIKES = [
  "Kaineng Overlook",
  "Harvest Temple",
  "Old Lion's Court",
  "Aetherblade Hideout",
  "Xunlai Jade Junkyard",
];

const SOTO_STRIKES = ["Temple of Febe", "Cosmic Observatory"];

/**
 * Calculate the day's strikes
 */
function getStrike() {
  let referenceDate = new Date();
  return getStrikeForDate(referenceDate);
}

function getStrikeForDate(referenceDate) {
  const msSinceStrikeBaseline =
    referenceDate.getTime() - STRIKE_BASELINE_DATE.getTime();
  const strikeIndex =
    Math.floor(msSinceStrikeBaseline / msPerDay) % IBS_STRIKES.length;
  const canthaStrikeIndex =
    Math.floor(msSinceStrikeBaseline / msPerDay) % EOD_STRIKES.length;
  const sotoStrikeIndex =
    Math.floor(msSinceStrikeBaseline / msPerDay) % SOTO_STRIKES.length;

  return {
    ibs: IBS_STRIKES[strikeIndex],
    eod: EOD_STRIKES[canthaStrikeIndex],
    soto: SOTO_STRIKES[sotoStrikeIndex],
  };
}

module.exports = {
  getStrike,
  getStrikeForDate,
};
