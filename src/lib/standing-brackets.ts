export type StandingBracketTeam = {
  name: string;
  aliases?: string[];
};

export type StandingBracketGroup = {
  name: string;
  teams: StandingBracketTeam[];
};

export type StandingBracketLayout = {
  categorySlug: string;
  title: string;
  description: string;
  advancingPerGroup: number;
  groups: StandingBracketGroup[];
  formatNotes: string[];
};

export const standingBracketLayouts: Record<string, StandingBracketLayout> = {
  "basketball-open-category": {
    categorySlug: "basketball-open-category",
    title: "Basketball Open bracket standings",
    description: "Official bracket groupings for the Mayor's Cup 2026 Open Category.",
    advancingPerGroup: 2,
    groups: [
      {
        name: "Category A",
        teams: [
          { name: "Sunberry 1" },
          { name: "BF Better Living" },
          { name: "Camella Homes", aliases: ["Camella"] },
          { name: "St. Dominic" },
          { name: "Pacific Grande 1" },
          { name: "Happy Homes" },
        ],
      },
      {
        name: "Category B",
        teams: [
          { name: "Collinwood" },
          { name: "Fleur De Ville" },
          { name: "Vistabella" },
          { name: "Bayswater" },
          { name: "Corinthians" },
        ],
      },
      {
        name: "Category C",
        teams: [
          { name: "Bali Residences", aliases: ["Bali"] },
          { name: "Bougainvillea" },
          { name: "Deca 5" },
          { name: "Genesis" },
          { name: "Portville Prime", aliases: ["Portville"] },
        ],
      },
      {
        name: "Category D",
        teams: [
          { name: "Deca 1" },
          { name: "Sunrise Place", aliases: ["Sunrise"] },
          { name: "La Aldea Del Mar" },
          { name: "Deca 4" },
          { name: "Joanna Homes" },
        ],
      },
    ],
    formatNotes: [
      "Single round elimination per bracket",
      "Top 2 teams from each bracket advance to the quarterfinals",
      "Top 8 teams move into crossover semifinals",
      "Finals crown one champion",
    ],
  },
  "basketball-under-18": {
    categorySlug: "basketball-under-18",
    title: "Basketball Under 18 bracket standings",
    description: "Official groupings for the Mayor's Cup 2026 Under 18 Category.",
    advancingPerGroup: 4,
    groups: [
      {
        name: "Group A",
        teams: [
          { name: "Deca 4" },
          { name: "Deca 5" },
          { name: "Bayswater" },
          { name: "Collinwood" },
          { name: "Vistabella" },
        ],
      },
      {
        name: "Group B",
        teams: [
          { name: "Pacific Grande 1" },
          { name: "Camella Homes", aliases: ["Camella"] },
          { name: "Bougainvillea" },
          { name: "Deca 1" },
          { name: "Corinthians" },
        ],
      },
    ],
    formatNotes: [
      "Single round elimination per bracket",
      "Top 4 teams from each bracket advance to the quarterfinals",
      "Top 8 teams move into crossover semifinals",
      "Finals crown one champion",
    ],
  },
};

export function getStandingBracketLayout(categorySlug: string) {
  return standingBracketLayouts[categorySlug];
}

