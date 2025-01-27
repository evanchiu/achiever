#!/usr/bin/env node
const axios = require("axios");
const fsPromises = require("fs").promises;

const DB_FILE = "src/components/vault-db.json";

/**
 * Load all objectives from the API
 */
async function loadObjectives() {
  // Get all objective ids
  const allResponse = await axios.get(
    "https://api.guildwars2.com/v2/wizardsvault/objectives",
  );

  // Get all objectives
  const objResponse = await axios.get(
    "https://api.guildwars2.com/v2/wizardsvault/objectives",
    { params: { ids: allResponse.data.join(",") } },
  );
  return objResponse.data;
}

/**
 * Load database from file
 */
async function loadDatabase() {
  // Read database
  const data = await fsPromises.readFile(DB_FILE, { encoding: "utf8" });
  return JSON.parse(data);
}

/**
 * Shorten/simplify objective text
 */
function simplifyObjective(title, existing) {
  let simple = existing || "";
  if (
    title.match(/^Complete 5 Bounty Missions in (the )?(.*) or Group Events$/)
  ) {
    const match = title.match(
      /Complete 5 Bounty Missions in (the )?(.*) or Group Events/,
    );
    simple = `${match[2]} Bounty`;
  } else if (title == "Break 1 Enemy's Defiance Bar") {
    simple = "Break Bar";
  } else if (title.match(/Capture (\d+) (.*) in World vs. World/)) {
    const match = title.match(/Capture (\d+) (.*) in World vs. World/);
    simple = `WvW ${match[2]}`;
  } else if (title == "Catch 5 Fish") {
    simple = "Fish";
  } else if (title.match(/Complete 1 Event in (the )?(.*)/)) {
    const match = title.match(/Complete 1 Event in (the )?(.*)/);
    simple = `${match[2]} event`;
  } else if (title.match(/Complete the (.*) Jumping Puzzle/)) {
    const match = title.match(/Complete the (.*) Jumping Puzzle/);
    simple = `${match[1]} JP`;
  } else if (
    title.match(
      /Complete (the )?(.*) Meta-Event, Events in (.*), or Events in (.*)/,
    )
  ) {
    const match = title.match(
      /Complete (the )?(.*) Meta-Event, Events in (.*), or Events in (.*)/,
    );
    simple = `${match[2]} meta or ${match[3]}/${match[4]} events`;
  } else if (
    title.match(/Defeat the (.*) World Boss or Complete Events in (.*)/)
  ) {
    const match = title.match(
      /Defeat the (.*) World Boss or Complete Events in (.*)/,
    );
    simple = `${match[1]} or ${match[2]} events`;
  } else if (title.match(/View a Vista in (the )?(.*)/)) {
    const match = title.match(/View a Vista in (the )?(.*)/);
    simple = `${match[2]} vista`;
  } else if (title.match(/Defeat 10 .nemies in (the )?(.*)/)) {
    const match = title.match(/Defeat 10 .nemies in (the )?(.*)/);
    simple = `${match[2]} enemies`;
  } else if (title.match(/Defeat 100 (.*) or (.*)/)) {
    const match = title.match(/Defeat 100 (.*) or (.*)/);
    simple = `${match[1]} or ${match[2]}`;
  } else if (title.match(/(Harvest|Gather) (\d+) Resources with a (.*) (.*)/)) {
    const match = title.match(
      /(Harvest|Gather) (\d+) Resources with a (.*) (.*)/,
    );
    simple = match[4];
  } else if (title.match(/Salvage (\d+) Items/)) {
    simple = "Salvage";
  } else if (title.match(/Identify (\d+) Pieces of Unidentified Gear/)) {
    simple = "Identifications";
  } else if (title.match(/Complete (.*) Events$/)) {
    simple = `Events`;
  }
  return simple;
}

async function main() {
  // Load database and objectives
  const [db, objectives] = await Promise.all([
    loadDatabase(),
    loadObjectives(),
  ]);

  // Update database, overwriting objective details, and simplified succinct messages
  objectives.forEach((objective) => {
    db[objective.id] = Object.assign({}, db[objective.id], objective, {
      succinct: simplifyObjective(objective.title, db[objective.id]?.succinct),
    });
  });

  // Write database
  await fsPromises.writeFile(DB_FILE, JSON.stringify(db, undefined, 2));
}

if (require.main === module) {
  main();
}
