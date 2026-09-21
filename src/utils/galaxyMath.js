/**
 * Mathematics & physics algorithms for the Sunflower Milky Way and Fibonacci disc
 */

// Golden angle in radians (~137.508 degrees)
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Generates galactic spiral coordinates and particle physical states
 * @param {number} count Number of particles
 * @param {number} arms Number of spiral arms (e.g. 4)
 * @param {number} maxRadius Galaxy radius
 */
export function generateGalaxyData(count = 12000, arms = 4, maxRadius = 220) {
  // Float32Arrays for positions, origins, velocities, colors, and sizes
  const currentPositions = new Float32Array(count * 3);
  const originPositions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const particleTypes = new Uint8Array(count); // 0: Star dust, 1: Sunflower
  const angles = new Float32Array(count);
  const distances = new Float32Array(count);
  const orbitSpeeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Distribute particles from center (r > 26 to leave clear space for the giant sun and its golden corona) to maxRadius
    // Bias towards inner arms
    const progress = Math.pow(Math.random(), 1.6);
    const r = 26 + progress * (maxRadius - 26);
    distances[i] = r;

    // Determine spiral arm
    const armIndex = i % arms;
    const armAngle = (armIndex * (Math.PI * 2)) / arms;

    // Logarithmic / power spiral curve
    const spiralFactor = 2.4;
    const angle = armAngle + Math.log(r + 1) * spiralFactor;
    angles[i] = angle;

    // Dispersion away from the arm center
    const spread = (r / maxRadius) * 12 + 1.5;
    const randomAngle = Math.random() * Math.PI * 2;
    const randomRadius = Math.pow(Math.random(), 2) * spread;

    const offsetX = Math.cos(randomAngle) * randomRadius;
    const offsetZ = Math.sin(randomAngle) * randomRadius;
    // Flattened galaxy disc with slight vertical bulge in core
    const verticalSpread = Math.max(1, (1 - r / maxRadius) * 8 + Math.random() * 2.5);
    const offsetY = (Math.random() - 0.5) * verticalSpread;

    const x = Math.cos(angle) * r + offsetX;
    const z = Math.sin(angle) * r + offsetZ;
    const y = offsetY;

    currentPositions[i3] = x;
    currentPositions[i3 + 1] = y;
    currentPositions[i3 + 2] = z;

    originPositions[i3] = x;
    originPositions[i3 + 1] = y;
    originPositions[i3 + 2] = z;

    velocities[i3] = 0;
    velocities[i3 + 1] = 0;
    velocities[i3 + 2] = 0;

    // Orbit speed according to Kepler-like galaxy rotation curve
    orbitSpeeds[i] = (0.04 / Math.sqrt(r)) * (0.8 + Math.random() * 0.4);

    // 45% of particles are distinct glowing sunflowers, 55% are fine stardust
    const isSunflower = Math.random() < 0.45;
    particleTypes[i] = isSunflower ? 1 : 0;

    if (isSunflower) {
      // Natural pure texture lighting
      colors[i3] = 1.0;
      colors[i3 + 1] = 1.0;
      colors[i3 + 2] = 0.95;
      sizes[i] = 4.2 + Math.random() * 2.8;
    } else {
      // Very soft, subtle cosmic stardust (cream, soft amber, faint starlight)
      const colorChoice = Math.random();
      if (colorChoice > 0.5) {
        colors[i3] = 0.95;
        colors[i3 + 1] = 0.85;
        colors[i3 + 2] = 0.6;
        sizes[i] = 0.8 + Math.random() * 0.9;
      } else if (colorChoice > 0.2) {
        colors[i3] = 0.9;
        colors[i3 + 1] = 0.55;
        colors[i3 + 2] = 0.2;
        sizes[i] = 0.7 + Math.random() * 0.8;
      } else {
        // Deep cosmos violet
        colors[i3] = 0.65;
        colors[i3 + 1] = 0.4;
        colors[i3 + 2] = 0.85;
        sizes[i] = 0.9 + Math.random() * 0.8;
      }
    }
  }

  return {
    count,
    currentPositions,
    originPositions,
    velocities,
    colors,
    sizes,
    particleTypes,
    angles,
    distances,
    orbitSpeeds
  };
}

/**
 * Computes Fibonacci phyllotaxis positions for sunflower seeds
 * @param {number} seedCount Number of seeds
 * @param {number} spacing Distance multiplier
 */
export function generatePhyllotaxisSeeds(seedCount = 1400, spacing = 0.22) {
  const positions = [];
  const rotations = [];
  const scales = [];
  const colors = [];

  for (let i = 0; i < seedCount; i++) {
    const angle = i * GOLDEN_ANGLE;
    const r = spacing * Math.sqrt(i);

    // Slight dome curvature for 3D sunflower center
    const domeHeight = Math.cos((r / (spacing * Math.sqrt(seedCount))) * (Math.PI * 0.5)) * 1.6;

    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    const z = domeHeight;

    positions.push(x, y, z);
    rotations.push(angle);

    // Seeds grow slightly bigger toward the outer edge
    const scaleFactor = 0.18 + (r / (spacing * Math.sqrt(seedCount))) * 0.16;
    scales.push(scaleFactor);

    // Color gradient: deep burnt sienna in the middle, glowing gold on the outer ring
    const normalizedR = r / (spacing * Math.sqrt(seedCount));
    const red = 0.5 + normalizedR * 0.5;
    const green = 0.18 + normalizedR * 0.65;
    const blue = 0.02 + normalizedR * 0.1;
    colors.push(red, green, blue);
  }

  return {
    positions: new Float32Array(positions),
    rotations: new Float32Array(rotations),
    scales: new Float32Array(scales),
    colors: new Float32Array(colors)
  };
}
