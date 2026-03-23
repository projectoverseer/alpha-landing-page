/**
 * SVGO configuration.
 *
 * Uses preset-default with two conservative overrides:
 * - removeViewBox: false — preserves responsive scaling on <img> SVGs
 * - cleanupIds: false   — keeps original IDs; avoids collisions when multiple
 *                         SVGs are inlined on the same page
 */
export default {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIds: false,
        },
      },
    },
  ],
};
