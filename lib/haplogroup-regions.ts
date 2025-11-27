/**
 * Y-DNA Haplogroup distribution by country/region
 * Based on population genetics research and the reference map
 * Maps ISO 3166-1 alpha-3 country codes to dominant haplogroups
 */

export interface HaplogroupDistribution {
  dominant: string;
  secondary?: string;
  percentage?: number;
}

// Country code to dominant Y-DNA haplogroup mapping
export const COUNTRY_HAPLOGROUPS: Record<string, HaplogroupDistribution> = {
  // Western Europe - R1b dominant
  "GBR": { dominant: "R1b", secondary: "I1", percentage: 70 },
  "IRL": { dominant: "R1b", percentage: 85 },
  "FRA": { dominant: "R1b", secondary: "I", percentage: 60 },
  "ESP": { dominant: "R1b", secondary: "E1b1b", percentage: 70 },
  "PRT": { dominant: "R1b", percentage: 65 },
  "BEL": { dominant: "R1b", secondary: "I", percentage: 60 },
  "NLD": { dominant: "R1b", secondary: "I1", percentage: 50 },
  "DEU": { dominant: "R1b", secondary: "R1a", percentage: 45 },
  "AUT": { dominant: "R1b", secondary: "R1a", percentage: 35 },
  "CHE": { dominant: "R1b", secondary: "I", percentage: 50 },
  "ITA": { dominant: "R1b", secondary: "J2", percentage: 40 },

  // Scandinavia - I1 dominant
  "NOR": { dominant: "I1", secondary: "R1b", percentage: 40 },
  "SWE": { dominant: "I1", secondary: "R1a", percentage: 40 },
  "DNK": { dominant: "I1", secondary: "R1b", percentage: 35 },
  "ISL": { dominant: "I1", secondary: "R1b", percentage: 35 },
  "FIN": { dominant: "N1c", secondary: "I1", percentage: 60 },

  // Eastern Europe - R1a dominant
  "POL": { dominant: "R1a", secondary: "R1b", percentage: 55 },
  "CZE": { dominant: "R1a", secondary: "R1b", percentage: 35 },
  "SVK": { dominant: "R1a", secondary: "R1b", percentage: 40 },
  "UKR": { dominant: "R1a", secondary: "I2a", percentage: 45 },
  "BLR": { dominant: "R1a", secondary: "N1c", percentage: 50 },
  "RUS": { dominant: "R1a", secondary: "N1c", percentage: 45 },
  "LTU": { dominant: "R1a", secondary: "N1c", percentage: 40 },
  "LVA": { dominant: "R1a", secondary: "N1c", percentage: 40 },
  "EST": { dominant: "N1c", secondary: "R1a", percentage: 35 },

  // Balkans - I2a and others
  "SRB": { dominant: "I2a", secondary: "R1a", percentage: 35 },
  "HRV": { dominant: "I2a", secondary: "R1a", percentage: 40 },
  "BIH": { dominant: "I2a", secondary: "R1a", percentage: 50 },
  "SVN": { dominant: "R1a", secondary: "I2a", percentage: 35 },
  "MNE": { dominant: "I2a", secondary: "J2", percentage: 30 },
  "ALB": { dominant: "E1b1b", secondary: "J2", percentage: 25 },
  "MKD": { dominant: "I2a", secondary: "E1b1b", percentage: 25 },
  "BGR": { dominant: "I2a", secondary: "R1a", percentage: 25 },
  "ROU": { dominant: "R1a", secondary: "I2a", percentage: 20 },
  "GRC": { dominant: "E1b1b", secondary: "J2", percentage: 25 },

  // Middle East - J dominant
  "TUR": { dominant: "J2", secondary: "R1b", percentage: 25 },
  "IRN": { dominant: "J2", secondary: "R1a", percentage: 25 },
  "IRQ": { dominant: "J1", secondary: "J2", percentage: 35 },
  "SAU": { dominant: "J1", secondary: "J2", percentage: 45 },
  "YEM": { dominant: "J1", percentage: 70 },
  "OMN": { dominant: "J1", secondary: "J2", percentage: 50 },
  "ARE": { dominant: "J1", secondary: "J2", percentage: 45 },
  "KWT": { dominant: "J1", secondary: "J2", percentage: 40 },
  "QAT": { dominant: "J1", secondary: "J2", percentage: 40 },
  "BHR": { dominant: "J1", secondary: "J2", percentage: 40 },
  "JOR": { dominant: "J1", secondary: "J2", percentage: 40 },
  "SYR": { dominant: "J2", secondary: "J1", percentage: 30 },
  "LBN": { dominant: "J2", secondary: "J1", percentage: 30 },
  "ISR": { dominant: "J1", secondary: "J2", percentage: 35 },
  "PSE": { dominant: "J1", secondary: "J2", percentage: 40 },

  // Caucasus - G and J
  "GEO": { dominant: "G", secondary: "J2", percentage: 35 },
  "ARM": { dominant: "R1b", secondary: "J2", percentage: 30 },
  "AZE": { dominant: "J1", secondary: "J2", percentage: 30 },

  // Central Asia - R1a and others
  "KAZ": { dominant: "C2", secondary: "R1a", percentage: 40 },
  "UZB": { dominant: "R1a", secondary: "J", percentage: 30 },
  "TKM": { dominant: "R1a", secondary: "J", percentage: 30 },
  "TJK": { dominant: "R1a", secondary: "J", percentage: 35 },
  "KGZ": { dominant: "R1a", secondary: "C2", percentage: 40 },
  "AFG": { dominant: "R1a", secondary: "G", percentage: 30 },
  "PAK": { dominant: "R1a", secondary: "L", percentage: 30 },

  // South Asia - R1a, H, L dominant
  "IND": { dominant: "H", secondary: "R1a", percentage: 25 },
  "BGD": { dominant: "R1a", secondary: "H", percentage: 30 },
  "LKA": { dominant: "H", secondary: "R1a", percentage: 30 },
  "NPL": { dominant: "R1a", secondary: "O", percentage: 25 },

  // East Asia - O dominant
  "CHN": { dominant: "O", secondary: "C2", percentage: 75 },
  "JPN": { dominant: "D", secondary: "O", percentage: 35 },
  "KOR": { dominant: "O", percentage: 75 },
  "MNG": { dominant: "C2", secondary: "O", percentage: 55 },
  "TWN": { dominant: "O", percentage: 80 },

  // Southeast Asia - O dominant
  "VNM": { dominant: "O", percentage: 80 },
  "THA": { dominant: "O", percentage: 75 },
  "MMR": { dominant: "O", secondary: "D", percentage: 65 },
  "KHM": { dominant: "O", percentage: 70 },
  "LAO": { dominant: "O", percentage: 70 },
  "MYS": { dominant: "O", percentage: 65 },
  "IDN": { dominant: "O", secondary: "C", percentage: 70 },
  "PHL": { dominant: "O", percentage: 50 },
  "SGP": { dominant: "O", percentage: 75 },

  // North Africa - E1b1b dominant
  "MAR": { dominant: "E1b1b", secondary: "J1", percentage: 65 },
  "DZA": { dominant: "E1b1b", secondary: "J1", percentage: 55 },
  "TUN": { dominant: "E1b1b", secondary: "J1", percentage: 55 },
  "LBY": { dominant: "E1b1b", secondary: "J1", percentage: 45 },
  "EGY": { dominant: "E1b1b", secondary: "J1", percentage: 40 },

  // Sub-Saharan Africa - E1b1a dominant
  "NGA": { dominant: "E1b1a", percentage: 80 },
  "GHA": { dominant: "E1b1a", percentage: 85 },
  "SEN": { dominant: "E1b1a", percentage: 80 },
  "MLI": { dominant: "E1b1a", percentage: 80 },
  "CMR": { dominant: "E1b1a", secondary: "E1b1b", percentage: 75 },
  "COD": { dominant: "E1b1a", percentage: 75 },
  "AGO": { dominant: "E1b1a", percentage: 80 },
  "KEN": { dominant: "E1b1a", secondary: "A", percentage: 50 },
  "TZA": { dominant: "E1b1a", secondary: "B", percentage: 50 },
  "ETH": { dominant: "E1b1b", secondary: "J", percentage: 45 },
  "SOM": { dominant: "E1b1b", secondary: "T", percentage: 80 },
  "SDN": { dominant: "E1b1b", secondary: "J", percentage: 35 },
  "ZAF": { dominant: "E1b1a", secondary: "B", percentage: 50 },
  "MOZ": { dominant: "E1b1a", percentage: 65 },
  "ZWE": { dominant: "E1b1a", percentage: 70 },
  "ZMB": { dominant: "E1b1a", percentage: 70 },
  "MWI": { dominant: "E1b1a", percentage: 65 },
  "UGA": { dominant: "E1b1a", secondary: "B", percentage: 55 },
  "RWA": { dominant: "E1b1a", secondary: "B", percentage: 60 },
  "BDI": { dominant: "E1b1a", secondary: "B", percentage: 60 },
  "COG": { dominant: "E1b1a", percentage: 75 },
  "GAB": { dominant: "E1b1a", percentage: 75 },
  "GNQ": { dominant: "E1b1a", percentage: 75 },
  "CAF": { dominant: "E1b1a", percentage: 70 },
  "TCD": { dominant: "E1b1a", secondary: "R1b", percentage: 60 },
  "NER": { dominant: "E1b1a", secondary: "R1b", percentage: 60 },
  "BFA": { dominant: "E1b1a", percentage: 80 },
  "CIV": { dominant: "E1b1a", percentage: 85 },
  "GIN": { dominant: "E1b1a", percentage: 80 },
  "LBR": { dominant: "E1b1a", percentage: 85 },
  "SLE": { dominant: "E1b1a", percentage: 85 },
  "GMB": { dominant: "E1b1a", percentage: 80 },
  "MRT": { dominant: "E1b1b", secondary: "E1b1a", percentage: 50 },
  "BEN": { dominant: "E1b1a", percentage: 80 },
  "TGO": { dominant: "E1b1a", percentage: 80 },

  // Americas - Q and mixed
  "USA": { dominant: "R1b", secondary: "I", percentage: 45 },
  "CAN": { dominant: "R1b", secondary: "I", percentage: 45 },
  "MEX": { dominant: "Q", secondary: "R1b", percentage: 45 },
  "GTM": { dominant: "Q", secondary: "R1b", percentage: 55 },
  "HND": { dominant: "Q", secondary: "R1b", percentage: 50 },
  "SLV": { dominant: "Q", secondary: "R1b", percentage: 50 },
  "NIC": { dominant: "Q", secondary: "R1b", percentage: 50 },
  "CRI": { dominant: "R1b", secondary: "Q", percentage: 40 },
  "PAN": { dominant: "Q", secondary: "R1b", percentage: 45 },
  "COL": { dominant: "R1b", secondary: "Q", percentage: 35 },
  "VEN": { dominant: "R1b", secondary: "Q", percentage: 35 },
  "ECU": { dominant: "Q", secondary: "R1b", percentage: 50 },
  "PER": { dominant: "Q", secondary: "R1b", percentage: 60 },
  "BOL": { dominant: "Q", secondary: "R1b", percentage: 65 },
  "CHL": { dominant: "R1b", secondary: "Q", percentage: 40 },
  "ARG": { dominant: "R1b", secondary: "I", percentage: 55 },
  "URY": { dominant: "R1b", secondary: "I", percentage: 50 },
  "BRA": { dominant: "R1b", secondary: "E1b1a", percentage: 40 },
  "PRY": { dominant: "Q", secondary: "R1b", percentage: 45 },

  // Oceania
  "AUS": { dominant: "R1b", secondary: "I", percentage: 45 },
  "NZL": { dominant: "R1b", secondary: "I", percentage: 45 },
  "PNG": { dominant: "C", secondary: "M", percentage: 60 },
  "FJI": { dominant: "M", secondary: "C", percentage: 50 },

  // Siberia
  "RUS_SIB": { dominant: "N1c", secondary: "C2", percentage: 40 },
};

// Region boundaries for custom polygon coloring (for areas not covered by countries)
export const CUSTOM_REGIONS: Record<string, { bounds: [[number, number], [number, number]]; haplogroup: string }> = {
  "Siberia_Yakutia": {
    bounds: [[110, 55], [170, 75]],
    haplogroup: "N1c"
  },
  "Tibet": {
    bounds: [[78, 27], [100, 37]],
    haplogroup: "D"
  },
  "Basque": {
    bounds: [[-3, 42], [1, 44]],
    haplogroup: "R1b"
  },
};

// Get color for haplogroup (re-export for convenience)
export { Y_DNA_COLORS } from "./haplogroup-colors";
