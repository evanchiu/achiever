function summarize(report) {
  const start = new Date(
    report.timeStartStd.replace(" ", "T").replace(" ", "")
  );
  const fightName = baseFightName(report.fightName, report.isCM);
  const encounter = wings
    .flatMap((wing) => wing.encounters)
    .find((encounter) => encounter.name === fightName);

  const players = report.players.map((player) => {
    const downs = countMechanicsByName(report, player.name, "Downed");
    const deaths = countMechanicsByName(report, player.name, "Dead");
    const playerSummary = {
      name: player.name,
      account: player.account,
      profession: player.profession,
      hasCommanderTag: player.hasCommanderTag,
      targetDps: player.dpsTargets[0][0],
      allDps: player.dpsAll[0],
      downs,
      deaths,
    };

    encounter.mechanics.forEach((mechanic) => {
      playerSummary[mechanic.name] = countMechanicsByName(
        report,
        player.name,
        mechanic.name
      );
    });

    return playerSummary;
  });

  const squad = {
    targetDps: players.reduce((sum, player) => {
      return sum + player.targetDps.dps;
    }, 0),
    allDps: players.reduce((sum, player) => {
      return sum + player.allDps.dps;
    }, 0),
    targetBreakbar: players.reduce((sum, player) => {
      return sum + player.targetDps.breakbarDamage;
    }, 0),
    allBreakbar: players.reduce((sum, player) => {
      return sum + player.allDps.breakbarDamage;
    }, 0),
    downs: players.reduce((sum, player) => {
      return sum + player.downs;
    }, 0),
    deaths: players.reduce((sum, player) => {
      return sum + player.deaths;
    }, 0),
  };

  return {
    start,
    fightName,
    success: report.success,
    isCM: report.isCM,
    duration: report.duration,
    eliteInsightsVersion: report.eliteInsightsVersion,
    players,
    squad,
  };
}

/** Truncate the CM from the fight name if CM is turned on */
function baseFightName(fightName, isCM) {
  if (isCM) {
    return fightName.substring(0, fightName.length - 3);
  } else {
    return fightName;
  }
}

function countMechanics(report, playerName, mechanicFilter) {
  return report.mechanics.filter(mechanicFilter).reduce((sum, mechanic) => {
    const events = new Set(
      mechanic.mechanicsData
        .filter((event) => playerName === event.actor)
        .map((event) => event.time)
    ).size;
    return sum + events;
  }, 0);
}

function countMechanicsByName(report, playerName, mechanicName) {
  return countMechanics(
    report,
    playerName,
    (mechanic) => mechanic.name === mechanicName
  );
}

const wings = [
  {
    wing: 1,
    name: "Spirit Vale",
    encounters: [
      {
        name: "Vale Guardian",
        id: "vale_guardian",
        trophyId: 77705,
        slug: "vg",
        mechanics: [
          {
            name: "Split TP",
          },
          {
            name: "Boss TP",
          },
        ],
        mechanicSums: [
          {
            mechanics: ["Split TP", "Boss TP"],
            max: 2,
          },
        ],
      },
      {
        name: "Spirit Woods",
        id: "spirit_woods",
      },
      {
        name: "Gorseval the Multifarious",
        id: "gorseval",
        trophyId: 77751,
        slug: "gors",
        mechanics: [
          {
            name: "Slam",
            max: 2,
          },
          {
            name: "Egg",
            max: 0,
          },
          {
            name: "Orb Debuff",
            custom:
              "0 max during Burn Phases, Melee DPS are allowed so long as they are intentionally going out to break orbs.",
          },
        ],
      },
      {
        name: "Sabetha the Saboteur",
        id: "sabetha",
        trophyId: 77728,
        slug: "sab",
        mechanics: [
          {
            name: "Launched",
            custom: "★ Specialty role: cannon",
          },
          {
            name: "Flak",
            custom:
              "Low overall (especially if not the kiter), determined on a case by case basis",
          },
          {
            name: "Karde Flame",
            max: 3,
          },
        ],
      },
    ],
  },
  {
    wing: 2,
    name: "Salvation Pass",
    encounters: [
      {
        name: "Slothasor",
        id: "slothasor",
        trophyId: 77706,
        slug: "sloth",
        mechanics: [
          {
            name: "Tantrum",
            max: 2,
          },
          {
            name: "Breath",
            max: 2,
          },
          {
            name: "Shake",
            max: 3,
          },
        ],
      },
      {
        name: "Bandit Trio",
        id: "bandit_trio",
      },
      {
        name: "Matthias Gabrel",
        id: "matthias",
        trophyId: 77679,
        slug: "matt",
        mechanics: [
          {
            name: "Jump Shards",
            max: 2,
          },
          {
            name: "Tornado",
            custom: "Low overall, determined on a case by case basis",
          },
          {
            name: "Storm",
            custom: "Low overall, determined on a case by case basis",
          },
          {
            name: "Spirit",
            custom: "Low overall, determined on a case by case basis",
          },
        ],
      },
    ],
  },
  {
    wing: 3,
    name: "Stronghold of the Faithful",
    encounters: [
      {
        name: "Escort",
        id: "escort",
      },
      {
        name: "Keep Construct",
        id: "keep_construct",
        trophyId: 78902,
        slug: "kc",
        mechanics: [
          {
            name: "GW.Orb",
          },
          {
            name: "GR.Orb",
          },
          {
            name: "BW.Orb",
          },
          {
            name: "BR.Orb",
          },
        ],
        mechanicSums: [
          {
            mechanics: ["GW.Orb", "GR.Orb"],
            min: 6,
          },
          {
            mechanics: ["BW.Orb", "BR.Orb"],
            max: 2,
          },
        ],
      },
      {
        name: "Twisted Castle",
        id: "twisted_castle",
      },
      {
        name: "Xera",
        id: "xera",
        trophyId: 78942,
        slug: "xera",
        mechanics: [
          {
            name: "Orb",
            max: 2,
          },
          {
            name: "Orb Aoe",
            custom: "Low overall, determined on a case by case basis",
          },
        ],
      },
    ],
  },
  {
    wing: 4,
    name: "Bastion of the Penitent",
    encounters: [
      {
        name: "Cairn",
        id: "cairn",
        trophyId: 80623,
        slug: "cairn",
        mechanics: [
          {
            name: "Port",
            max: 2,
          },
          {
            name: "Leap",
            max: 1,
          },
          {
            name: "Sweep",
            max: 1,
          },
          {
            name: "Donut",
            max: 1,
          },
          {
            name: "Agony",
            custom: "★ Specialty role: Agony Baiter",
          },
        ],
      },
      {
        name: "Mursaat Overseer",
        id: "mursaat_overseer",
        trophyId: 80269,
        slug: "mo",
        mechanics: [
          {
            name: "Jade",
            custom: "Low overall, determined on a case by case basis",
          },
        ],
      },
      {
        name: "Samarog",
        id: "samarog",
        trophyId: 80087,
        slug: "sam",
        mechanics: [
          {
            name: "Shck.Wv",
          },
          {
            name: "Swp",
          },
          {
            name: "Trpl",
          },
          {
            name: "Slam",
          },
          {
            name: "Gr.Fl",
            max: 0,
          },
        ],
        mechanicSums: [
          {
            mechanics: ["Shck.Wv", "Swp", "Trpl", "Slam"],
            max: 3,
          },
        ],
      },
      {
        name: "Deimos",
        id: "deimos",
        trophyId: 80542,
        slug: "dei",
        mechanics: [
          {
            name: "Pizza",
            max: 2,
          },
          {
            name: "Oil T.",
            max: 0,
          },
        ],
      },
    ],
  },
  {
    wing: 5,
    name: "Hall of Chains",
    encounters: [
      {
        name: "Soulless Horror",
        id: "soulless_horror",
        trophyId: 85993,
        slug: "sh",
        mechanics: [
          {
            name: "Donut In",
          },
          {
            name: "Donut Out",
          },
          {
            name: "Golem",
            custom: "Low overall, determined on a case by case basis",
          },
          {
            name: "Scythe",
            custom: "Low overall, determined on a case by case basis",
          },
          {
            name: "Fixate",
            custom: "★ Specialty role: Tanking",
          },
          {
            name: "8Slice",
            max: 2,
          },
        ],
        mechanicSums: [
          {
            mechanics: ["Donut In", "Donut Out"],
            max: 2,
          },
        ],
      },
      {
        name: "River of Souls",
        id: "river_of_souls",
      },
      {
        name: "Statues of Grenth",
        id: "statues_of_grenth",
      },
      {
        name: "Dhuum",
        id: "voice_in_the_void",
        trophyId: 85633,
        slug: "dhuum",
        mechanics: [
          {
            name: "Golem",
            custom: "1 max (unless you are the kiter)",
          },
          {
            name: "Crack",
            max: 1,
          },
          {
            name: "Suck dmg",
            max: 1,
          },
          {
            name: "Mark",
            custom: "Low overall, determined on a case by case basis",
          },
          {
            name: "Orb CD",
            custom: "★ Specialty role: Greens",
          },
        ],
      },
    ],
  },
  {
    wing: 6,
    name: "Mythwright Gambit",
    encounters: [
      {
        name: "Conjured Amalgamate",
        id: "conjured_amalgamate",
        trophyId: 88543,
        slug: "ca",
        mechanics: [
          {
            name: "Arm Slam",
            max: 1,
          },
          {
            name: "Sword.C",
            custom: "★ Specialty role: Sword Collector",
          },
          {
            name: "Shield.C",
            custom: "★ Specialty role: Shield Collector",
          },
        ],
      },
      {
        name: "Twin Largos",
        id: "twin_largos",
        trophyId: 88860,
        slug: "twins",
        mechanics: [
          {
            name: "Charge",
            custom: "3 max (left side), 1 max (right side)",
          },
          {
            name: "KB/Launch",
            max: 1,
          },
          {
            name: "Float",
            custom: "1 max (left side), 0 max (right side)",
          },
          {
            name: "Wave",
            custom: "1 max (left side), 0 max (right side)",
          },
          {
            name: "Steal",
            custom: "0 max (left side), 1 max (right side)",
          },
        ],
      },
      {
        name: "Qadim",
        id: "qadim",
        trophyId: 88645,
        slug: "qadim",
        mechanics: [
          {
            name: "F.Dance",
            max: 3,
          },
          {
            name: "Q.Wave",
            max: 2,
          },
          {
            name: "Q.Hitbox",
            max: 2,
          },
          {
            name: "D.Wave",
            max: 1,
          },
          {
            name: "Lamp",
            custom: "★ Specialty role: Lamp (Note that Lamp 3 does not count)",
          },
        ],
      },
    ],
  },
  {
    wing: 7,
    name: "The Key of Ahdashim",
    encounters: [
      { name: "Gate", id: "gate" },
      {
        name: "Cardinal Adina",
        id: "adina",
        trophyId: 91246,
        slug: "adina",
        mechanics: [
          {
            name: "R.Blind",
            max: 1,
          },
          {
            name: "Perilous Pulse",
            max: 0,
            custom: "(unless tanking)",
          },
          {
            name: "Boulder",
            max: 1,
          },
          {
            name: "Mines",
            max: 0,
            custom: "(unless tanking)",
          },
        ],
      },
      {
        name: "Cardinal Sabir",
        id: "sabir",
        trophyId: 91270,
        slug: "sabir",
        mechanics: [
          {
            name: "Shockwave",
          },
          {
            name: "Arena AoE",
          },
          {
            name: "Pushed",
            max: 1,
          },
        ],
        mechanicSums: [
          {
            mechanics: ["Shockwave", "Arena AoE"],
            max: 1,
          },
        ],
      },
      {
        name: "Qadim the Peerless",
        id: "qadim_the_peerless",
        trophyId: 91175,
        slug: "qpeer",
        mechanics: [
          {
            name: "Pushed",
            max: 1,
          },
          {
            name: "P.Rect",
            custom: "Low overall, determined on a case by case basis",
          },
          {
            name: "Pattern.H",
            max: 2,
          },
          {
            name: "P.Magma",
          },
          {
            name: "Magma.F",
          },
          {
            name: "S.Magma.F",
          },
          {
            name: "Rush.H",
            max: 0,
          },
          {
            name: "A.Prj.H",
            max: 1,
          },
          {
            name: "Lght.H",
            custom: "Low overall, determined on a case by case basis",
          },
          {
            name: "S.Lght.H",
            custom:
              "Low overall, determined on a case by case basis (Leniency on DE kiters)",
          },
        ],
        mechanicSums: [
          {
            mechanics: ["P.Magma", "Magma.F", "S.Magma.F"],
            max: 1,
          },
        ],
      },
    ],
  },
];

export { wings, summarize };
