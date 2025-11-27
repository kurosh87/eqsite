/**
 * Haplogroup color mapping based on standard genetic genealogy conventions
 * Colors derived from the Y-DNA haplogroup world distribution map
 * Reference: public/images/23andme-reference.png
 */

// Y-DNA (Paternal) Haplogroup Colors
export const Y_DNA_COLORS: Record<string, string> = {
  // R haplogroup family - Blues
  "R": "#4169E1",      // Royal Blue (base)
  "R1": "#4169E1",
  "R1b": "#3B5998",    // Facebook Blue - Western Europe
  "R1b1": "#3B5998",
  "R1b1a": "#3B5998",
  "R1b1a1": "#3B5998",
  "R1b1a1a": "#3B5998",
  "R1b1a1a2": "#3B5998", // R-M269
  "R1b-M269": "#3B5998",
  "R1b-U106": "#4A6FA5",
  "R1b-P312": "#2C4A7C",
  "R1b-L21": "#1E3A5F",
  "R1a": "#5BC0EB",    // Light Blue/Cyan - Eastern Europe/South Asia
  "R1a1": "#5BC0EB",
  "R1a1a": "#5BC0EB",
  "R1a-M17": "#5BC0EB",
  "R1a-Z282": "#4DA8D5",
  "R1a-Z93": "#3B8BBE",
  "R2": "#6495ED",     // Cornflower Blue

  // I haplogroup family - Purples
  "I": "#9B59B6",      // Purple - Northern Europe
  "I1": "#9B59B6",     // Scandinavia
  "I1a": "#9B59B6",
  "I2": "#8E44AD",     // Darker purple - Balkans
  "I2a": "#8E44AD",
  "I2a1": "#8E44AD",
  "I2a2": "#7D3C98",
  "I2b": "#7D3C98",

  // N haplogroup family - Teals
  "N": "#1ABC9C",      // Teal - Finland, Siberia
  "N1": "#1ABC9C",
  "N1a": "#1ABC9C",
  "N1c": "#16A085",
  "N1c1": "#16A085",

  // O haplogroup family - Reds
  "O": "#E74C3C",      // Red - East Asia
  "O1": "#E74C3C",
  "O1a": "#E74C3C",
  "O1b": "#D63031",
  "O2": "#C0392B",     // Dark Red - China
  "O2a": "#C0392B",
  "O2b": "#B33939",
  "O3": "#A93226",

  // Q haplogroup family - Yellows/Orange
  "Q": "#F39C12",      // Orange/Yellow - Native Americas, Siberia
  "Q1": "#F39C12",
  "Q1a": "#F39C12",
  "Q1a2": "#F39C12",
  "Q1a2a": "#F39C12",  // Q-M3 (Native American)
  "Q-M3": "#F39C12",
  "Q1b": "#E67E22",
  "Q-M242": "#D68910",

  // J haplogroup family - Greens
  "J": "#27AE60",      // Green - Middle East
  "J1": "#27AE60",
  "J1a": "#27AE60",
  "J-M267": "#27AE60",
  "J2": "#229954",     // Slightly darker - Mediterranean
  "J2a": "#229954",
  "J2b": "#1E8449",
  "J-M172": "#229954",

  // E haplogroup family - Browns/Tans
  "E": "#D4A373",      // Tan/Brown - Africa
  "E1": "#D4A373",
  "E1a": "#D4A373",
  "E1b": "#C19A6B",
  "E1b1": "#C19A6B",
  "E1b1a": "#B8860B",  // West Africa
  "E1b1a1": "#B8860B",
  "E1b1b": "#CD853F",  // North Africa/Mediterranean
  "E1b1b1": "#CD853F",
  "E-M96": "#D4A373",
  "E-V13": "#CD853F",
  "E-M35": "#CD853F",

  // D haplogroup family - Dark Reds
  "D": "#922B21",      // Dark Red - Japan, Tibet
  "D1": "#922B21",
  "D1a": "#922B21",
  "D2": "#7B241C",
  "D-M174": "#922B21",

  // C haplogroup family - Gold/Yellow
  "C": "#F1C40F",      // Yellow/Gold - Mongolia, Oceania
  "C1": "#F1C40F",
  "C2": "#D4AC0D",
  "C-M130": "#F1C40F",
  "C-M217": "#D4AC0D",

  // G haplogroup family - Light Greens
  "G": "#7CB518",      // Light Green - Caucasus
  "G1": "#7CB518",
  "G2": "#6B9B0D",
  "G2a": "#6B9B0D",
  "G-M201": "#7CB518",

  // T haplogroup family - Olive
  "T": "#6B8E23",      // Olive - Horn of Africa, Mediterranean
  "T1": "#6B8E23",
  "T1a": "#6B8E23",
  "T-M184": "#6B8E23",

  // L haplogroup family - Orange-Red
  "L": "#FF6B35",      // Orange - South Asia
  "L1": "#FF6B35",
  "L-M20": "#FF6B35",

  // H (Y-DNA) - Cyan
  "H": "#00CED1",      // Dark Turquoise - South Asia (Y-DNA H)
  "H1": "#00CED1",
  "H-M69": "#00CED1",

  // A haplogroup - Brownish
  "A": "#8B4513",      // Saddle Brown - Africa (oldest)
  "A00": "#5D3A1A",
  "A0": "#6B4423",
  "A1": "#7A4B28",

  // B haplogroup - Dark Brown
  "B": "#654321",      // Dark Brown - Africa
  "B-M60": "#654321",
};

// mtDNA (Maternal) Haplogroup Colors
export const MT_DNA_COLORS: Record<string, string> = {
  // H haplogroup family - Blues (most common European)
  "H": "#3498DB",
  "H1": "#3498DB",
  "H2": "#2E86C1",
  "H3": "#2874A6",
  "H5": "#21618C",
  "HV": "#5DADE2",

  // U haplogroup family - Purples
  "U": "#9B59B6",
  "U2": "#9B59B6",
  "U3": "#8E44AD",
  "U4": "#7D3C98",
  "U5": "#6C3483",
  "U5a": "#6C3483",
  "U5b": "#5B2C6F",
  "U6": "#884EA0",
  "U7": "#7B4D96",
  "U8": "#6E4080",

  // K haplogroup family - Teals
  "K": "#1ABC9C",
  "K1": "#1ABC9C",
  "K1a": "#17A589",
  "K1b": "#148F77",
  "K2": "#117A65",

  // V haplogroup family - Greens
  "V": "#27AE60",
  "V1": "#27AE60",
  "V2": "#229954",

  // J haplogroup family - Orange
  "J": "#E67E22",
  "J1": "#E67E22",
  "J1b": "#D35400",
  "J1c": "#CA6F1E",
  "J2": "#BA4A00",

  // T haplogroup family - Red
  "T": "#E74C3C",
  "T1": "#E74C3C",
  "T2": "#CB4335",

  // I haplogroup - Light Blue
  "I": "#5BC0EB",
  "I1": "#5BC0EB",
  "I2": "#4DA8D5",

  // W haplogroup - Yellow-Green
  "W": "#A4D233",
  "W1": "#A4D233",

  // X haplogroup - Pink/Magenta
  "X": "#E91E63",
  "X1": "#E91E63",
  "X2": "#D81B60",
  "X2a": "#C2185B",

  // L haplogroup family - Browns (African)
  "L": "#D4A373",
  "L0": "#D4A373",
  "L1": "#C19A6B",
  "L2": "#B8860B",
  "L3": "#CD853F",
  "L4": "#DEB887",
  "L5": "#D2B48C",
  "L6": "#C4A47A",

  // M haplogroup family - Reds (Asian)
  "M": "#C0392B",
  "M1": "#C0392B",
  "M2": "#A93226",
  "M3": "#922B21",

  // N haplogroup family - Teals
  "N": "#16A085",
  "N1": "#16A085",
  "N2": "#138D75",

  // A haplogroup - Orange (Native American/Asian)
  "A": "#F39C12",
  "A2": "#F39C12",

  // B haplogroup - Gold (Native American/Asian)
  "B": "#F1C40F",
  "B2": "#F1C40F",
  "B4": "#D4AC0D",
  "B5": "#B7950B",

  // C haplogroup - Cyan (Native American/Asian)
  "C": "#00BCD4",
  "C1": "#00BCD4",
  "C4": "#00ACC1",

  // D haplogroup - Dark Red (Native American/Asian)
  "D": "#922B21",
  "D1": "#922B21",
  "D4": "#7B241C",
};

/**
 * Get the color for a haplogroup based on its name
 * Handles subclades by finding the closest matching parent
 */
export function getHaplogroupColor(name: string, type: "paternal" | "maternal"): string {
  const colors = type === "paternal" ? Y_DNA_COLORS : MT_DNA_COLORS;
  const defaultColor = type === "paternal" ? "#3B82F6" : "#EC4899";

  // Clean up the name
  const cleanName = name.trim().toUpperCase();

  // Direct match
  if (colors[cleanName]) {
    return colors[cleanName];
  }

  // Try progressively shorter prefixes to find parent haplogroup
  let prefix = cleanName;
  while (prefix.length > 0) {
    if (colors[prefix]) {
      return colors[prefix];
    }
    // Remove last character (or last segment after hyphen)
    if (prefix.includes("-")) {
      prefix = prefix.split("-")[0];
    } else if (prefix.length > 1) {
      prefix = prefix.slice(0, -1);
    } else {
      break;
    }
  }

  // Try just the first letter (major haplogroup)
  const majorGroup = cleanName.charAt(0);
  if (colors[majorGroup]) {
    return colors[majorGroup];
  }

  return defaultColor;
}

/**
 * Get color with optional opacity
 */
export function getHaplogroupColorWithOpacity(
  name: string,
  type: "paternal" | "maternal",
  opacity: number = 1
): string {
  const hex = getHaplogroupColor(name, type);

  if (opacity === 1) return hex;

  // Convert hex to rgba
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get a lighter shade of the haplogroup color (for backgrounds)
 */
export function getHaplogroupBgColor(name: string, type: "paternal" | "maternal"): string {
  return getHaplogroupColorWithOpacity(name, type, 0.1);
}

/**
 * Get haplogroup color CSS variables for styling
 */
export function getHaplogroupColorVars(name: string, type: "paternal" | "maternal") {
  const color = getHaplogroupColor(name, type);
  return {
    "--haplogroup-color": color,
    "--haplogroup-color-10": getHaplogroupColorWithOpacity(name, type, 0.1),
    "--haplogroup-color-20": getHaplogroupColorWithOpacity(name, type, 0.2),
    "--haplogroup-color-50": getHaplogroupColorWithOpacity(name, type, 0.5),
  };
}
