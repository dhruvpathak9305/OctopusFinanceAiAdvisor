/**
 * SubcategoryColorGenerator.ts
 * Simple utility for generating harmonious subcategory colors based on parent category colors
 */

/**
 * Generates a new color shade based on a parent color
 *
 * @param baseColor - The parent color in hex format (e.g. "#22c55e")
 * @param variation - Value 0-3 that determines the type of variation:
 *                   0: lighter, 1: darker, 2: more saturated, 3: complementary
 * @param intensity - How strong the variation should be (10-30 recommended)
 * @returns New color in hex format
 */
export const generateColorShade = (
  baseColor: string,
  variation: number = 0,
  intensity: number = 15
): string => {
  // Default color if invalid input
  if (!baseColor || !baseColor.startsWith("#") || baseColor.length !== 7) {
    return "#6b7280"; // Default gray
  }

  try {
    // Extract RGB components
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);

    // Apply variation based on the variation index
    let newR = r;
    let newG = g;
    let newB = b;

    switch (variation % 4) {
      case 0: // Lighter
        newR = Math.min(255, r + intensity);
        newG = Math.min(255, g + intensity);
        newB = Math.min(255, b + intensity);
        break;
      case 1: // Darker
        newR = Math.max(0, r - intensity);
        newG = Math.max(0, g - intensity);
        newB = Math.max(0, b - intensity);
        break;
      case 2: // More saturated in dominant channel
        if (r >= g && r >= b) {
          newR = Math.min(255, r + intensity);
          newG = Math.max(0, g - Math.floor(intensity / 2));
          newB = Math.max(0, b - Math.floor(intensity / 2));
        } else if (g >= r && g >= b) {
          newG = Math.min(255, g + intensity);
          newR = Math.max(0, r - Math.floor(intensity / 2));
          newB = Math.max(0, b - Math.floor(intensity / 2));
        } else {
          newB = Math.min(255, b + intensity);
          newR = Math.max(0, r - Math.floor(intensity / 2));
          newG = Math.max(0, g - Math.floor(intensity / 2));
        }
        break;
      case 3: // Mix adjacent values
        if (r > g) {
          newR = Math.max(0, r - Math.floor(intensity / 2));
          newG = Math.min(255, g + Math.floor(intensity / 2));
        } else {
          newG = Math.max(0, g - Math.floor(intensity / 2));
          newB = Math.min(255, b + Math.floor(intensity / 2));
        }
        break;
    }

    // Convert back to hex
    const toHex = (c: number): string => {
      const hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  } catch (error) {
    console.error("Error generating color shade:", error);
    return "#6b7280"; // Default gray on error
  }
};

/**
 * Generate a color for a subcategory based on parent category color
 *
 * @param parentColor - The parent category color (ring_color)
 * @param subcategoryName - The name of the subcategory
 * @returns A color suitable for the subcategory
 */
export const generateSubcategoryColor = (
  parentColor: string,
  subcategoryName: string
): string => {
  if (!parentColor) return "#6b7280"; // Default gray

  // Create a variation seed based on the subcategory name
  // This ensures same subcategory names get similar colors
  const firstChar = subcategoryName.charCodeAt(0) || 65;
  const lastChar = subcategoryName.charCodeAt(subcategoryName.length - 1) || 65;
  const variationSeed = (firstChar * lastChar) % 4;

  // Determine intensity based on name length
  const intensity = 10 + (subcategoryName.length % 4) * 5;

  return generateColorShade(parentColor, variationSeed, intensity);
};

/**
 * Generate a lighter background color for icons based on a foreground color
 * Creates a lighter shade with some transparency for better visual appearance
 *
 * @param color - The color to create a background for (hex format)
 * @param opacity - The opacity level for the background (0-100)
 * @returns A lighter background color with transparency
 */
export const generateLighterBackground = (
  color: string,
  opacity: number = 15
): string => {
  if (!color || !color.startsWith("#") || color.length !== 7) {
    return "#6B728020"; // Default gray with transparency
  }

  try {
    // Extract RGB components
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Create a lighter version - add 40 to each component and cap at 255
    const lighterR = Math.min(255, r + 40);
    const lighterG = Math.min(255, g + 40);
    const lighterB = Math.min(255, b + 40);

    // Convert back to hex
    const toHex = (c: number): string => {
      const hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    // Add opacity as a hex value (0-100 converted to hex)
    const opacityHex = Math.round((opacity / 100) * 255)
      .toString(16)
      .padStart(2, "0");

    return `#${toHex(lighterR)}${toHex(lighterG)}${toHex(
      lighterB
    )}${opacityHex}`;
  } catch (error) {
    console.error("Error generating lighter background:", error);
    return "#6B728020"; // Default gray with transparency on error
  }
};
