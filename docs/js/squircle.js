class SquircleRenderer {
  constructor() {
    this.observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => this._updateSquircle(entry.target));
    });
    this.elements = new Map(); // Store elements and their original styles
    this.animationFrameId = null; // For the box-shadow monitoring loop
  }

  /**
   * Converts degrees to radians.
   * @param {number} degrees
   * @returns {number} radians
   */
  static _toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Tagged template literal to format numbers in SVG paths to 2 decimal places.
   * @param {TemplateStringsArray} strings
   * @param {...number[]} values
   * @returns {string} Formatted SVG path segment
   */
  static _rounded(strings, ...values) {
    return strings.reduce((acc, str, i) => {
      const value = values[i];
      if (typeof value === "number") {
        return acc + str + value.toFixed(2);
      } else {
        return acc + str + (value ?? "");
      }
    }, "");
  }

  /**
   * Calculates parameters for a single corner's SVG path segments.
   * Based on Figma blog post and MartinRGB's implementation.
   * @param {{cornerRadius: number, cornerSmoothing: number, preserveSmoothing: boolean, roundingAndSmoothingBudget: number}} params
   * @returns {{a: number, b: number, c: number, d: number, p: number, cornerRadius: number, arcSectionLength: number}}
   */
  static _getPathParamsForCorner({
    cornerRadius,
    cornerSmoothing,
    preserveSmoothing,
    roundingAndSmoothingBudget,
  }) {
    let p = (1 + cornerSmoothing) * cornerRadius;

    if (!preserveSmoothing) {
      const maxCornerSmoothing = roundingAndSmoothingBudget / cornerRadius - 1;
      cornerSmoothing = Math.min(cornerSmoothing, maxCornerSmoothing);
      p = Math.min(p, roundingAndSmoothingBudget);
    }

    const arcMeasure = 90 * (1 - cornerSmoothing);
    const arcSectionLength =
      Math.sin(SquircleRenderer._toRadians(arcMeasure / 2)) *
      cornerRadius *
      Math.sqrt(2);

    const angleAlpha = (90 - arcMeasure) / 2;
    const p3ToP4Distance =
      cornerRadius * Math.tan(SquircleRenderer._toRadians(angleAlpha / 2));

    const angleBeta = 45 * cornerSmoothing;
    const c = p3ToP4Distance * Math.cos(SquircleRenderer._toRadians(angleBeta));
    const d = c * Math.tan(SquircleRenderer._toRadians(angleBeta));

    let b = (p - arcSectionLength - c - d) / 3;
    let a = 2 * b;

    if (preserveSmoothing && p > roundingAndSmoothingBudget) {
      const p1ToP3MaxDistance =
        roundingAndSmoothingBudget - d - arcSectionLength - c;

      const minA = p1ToP3MaxDistance / 6;
      const maxB = p1ToP3MaxDistance - minA;

      b = Math.min(b, maxB);
      a = p1ToP3MaxDistance - b;
      p = Math.min(p, roundingAndSmoothingBudget);
    }

    return {
      a,
      b,
      c,
      d,
      p,
      arcSectionLength,
      cornerRadius,
    };
  }

  /**
   * Generates the full SVG path string for a squircle.
   * Adapted to use a single set of corner parameters for all 4 corners.
   * @param {{width: number, height: number, cornerPathParams: object}} input
   * @returns {string} SVG path data
   */
  static _getSVGPathFromPathParams({
    width,
    height,
    topLeftPathParams,
    topRightPathParams,
    bottomLeftPathParams,
    bottomRightPathParams,
  }) {
    // We need to use _rounded for ALL numeric values in the path string
    // even for the initial M and L commands.
    const startX = SquircleRenderer._rounded`${width - topRightPathParams.p}`;
    const startY = SquircleRenderer._rounded`0`; // Or just "0" if always integer 0

    const topRightPath = SquircleRenderer._drawTopRightPath(topRightPathParams);

    const L2X = SquircleRenderer._rounded`${width}`;
    const L2Y = SquircleRenderer._rounded`${height - bottomRightPathParams.p}`;
    const bottomRightPath = SquircleRenderer._drawBottomRightPath(
      bottomRightPathParams,
    );

    const L3X = SquircleRenderer._rounded`${bottomLeftPathParams.p}`;
    const L3Y = SquircleRenderer._rounded`${height}`;
    const bottomLeftPath =
      SquircleRenderer._drawBottomLeftPath(bottomLeftPathParams);

    const L4X = SquircleRenderer._rounded`0`; // Or just "0"
    const L4Y = SquircleRenderer._rounded`${topLeftPathParams.p}`;
    const topLeftPath = SquircleRenderer._drawTopLeftPath(topLeftPathParams);

    return `
      M ${startX} ${startY}
      ${topRightPath}
      L ${L2X} ${L2Y}
      ${bottomRightPath}
      L ${L3X} ${L3Y}
      ${bottomLeftPath}
      L ${L4X} ${L4Y}
      ${topLeftPath}
      Z
    `
      .replace(/[\t\s\n]+/g, " ")
      .trim();
  }

  /**
   * Draws the top-right corner path segment.
   */
  static _drawTopRightPath({ cornerRadius, a, b, c, d, p, arcSectionLength }) {
    if (cornerRadius) {
      return SquircleRenderer._rounded`
      c ${a} 0 ${a + b} 0 ${a + b + c} ${d}
      a ${cornerRadius} ${cornerRadius} 0 0 1 ${arcSectionLength} ${arcSectionLength}
      c ${d} ${c}
        ${d} ${b + c}
        ${d} ${a + b + c}`;
    } else {
      return SquircleRenderer._rounded`l ${p} 0`;
    }
  }

  // --- START: Helper functions from Figma/MartinRGB algorithm (as static methods) ---

  /**
   * Draws the bottom-right corner path segment.
   */
  static _drawBottomRightPath({
    cornerRadius,
    a,
    b,
    c,
    d,
    p,
    arcSectionLength,
  }) {
    if (cornerRadius) {
      return SquircleRenderer._rounded`
      c 0 ${a}
        0 ${a + b}
        ${-d} ${a + b + c}
      a ${cornerRadius} ${cornerRadius} 0 0 1 -${arcSectionLength} ${arcSectionLength}
      c ${-c} ${d}
        ${-(b + c)} ${d}
        ${-(a + b + c)} ${d}`;
    } else {
      return SquircleRenderer._rounded`l 0 ${p}`;
    }
  }

  /**
   * Draws the bottom-left corner path segment.
   */
  static _drawBottomLeftPath({
    cornerRadius,
    a,
    b,
    c,
    d,
    p,
    arcSectionLength,
  }) {
    if (cornerRadius) {
      return SquircleRenderer._rounded`
      c ${-a} 0
        ${-(a + b)} 0
        ${-(a + b + c)} ${-d}
      a ${cornerRadius} ${cornerRadius} 0 0 1 -${arcSectionLength} -${arcSectionLength}
      c ${-d} ${-c}
        ${-d} ${-(b + c)}
        ${-d} ${-(a + b + c)}`;
    } else {
      return SquircleRenderer._rounded`l ${-p} 0`;
    }
  }

  /**
   * Draws the top-left corner path segment.
   */
  static _drawTopLeftPath({ cornerRadius, a, b, c, d, p, arcSectionLength }) {
    if (cornerRadius) {
      return SquircleRenderer._rounded`
      c 0 ${-a}
        0 ${-(a + b)}
        ${d} ${-(a + b + c)}
      a ${cornerRadius} ${cornerRadius} 0 0 1 ${arcSectionLength} -${arcSectionLength}
      c ${c} ${-d}
        ${b + c} ${-d}
        ${a + b + c} ${-d}`;
    } else {
      return SquircleRenderer._rounded`l 0 ${-p}`;
    }
  }

  init() {
    // Target both [data-squircle-radius] elements and .btn-xl buttons
    document.querySelectorAll("[data-squircle-radius]").forEach((el) => {
      // Store initial styles before we override them
      const initialBorderRadius = getComputedStyle(el).borderRadius;
      const initialBorder = el.style.border;
      const initialFilter = el.style.filter; // Capture any existing filter

      this.elements.set(el, {
        originalBorderRadius: initialBorderRadius,
        initialBorder: initialBorder,
        initialFilter: initialFilter,
        lastComputedBoxShadow: "", // To track box-shadow changes
      });
      this._applySquircleStyles(el);
      this.observer.observe(el);
    });

    // Start monitoring for box-shadow changes on tracked elements
    this._startBoxShadowMonitoring();
  }

  _startBoxShadowMonitoring() {
    const monitor = () => {
      this.elements.forEach((data, element) => {
        const computedStyle = getComputedStyle(element);
        const currentBoxShadow = computedStyle.boxShadow;

        // If the box-shadow has changed, re-apply squircle styles
        if (currentBoxShadow !== data.lastComputedBoxShadow) {
          data.lastComputedBoxShadow = currentBoxShadow;
          this._applySquircleStyles(element);
        }
      });
      this.animationFrameId = requestAnimationFrame(monitor);
    };
    this.animationFrameId = requestAnimationFrame(monitor);
  }

  _applySquircleStyles(element) {
    const data = this.elements.get(element);
    if (!data) return; // Should not happen if element is in map

    const { originalBorderRadius } = data;
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Use the parsed radius from the initial border-radius
    const radius = parseFloat(originalBorderRadius);
    const cornerSmoothing = 0.6;

    // Calculate path parameters for a single corner
    const cornerParams = SquircleRenderer._getPathParamsForCorner({
      cornerRadius: radius,
      cornerSmoothing: cornerSmoothing,
      preserveSmoothing: false, // Typically false for this algorithm
      roundingAndSmoothingBudget: Math.min(width, height) / 2, // Max possible radius for the element
    });

    // Generate the full SVG path using the single corner parameters
    const pathData = SquircleRenderer._getSVGPathFromPathParams({
      width,
      height,
      topLeftPathParams: cornerParams,
      topRightPathParams: cornerParams,
      bottomLeftPathParams: cornerParams,
      bottomRightPathParams: cornerParams,
    });

    // Apply clip-path
    element.style.clipPath = `path("${pathData}")`;
    element.style.borderRadius = "0"; // Crucial: Remove native border-radius

    // --- Handle Border ---
    const computedStyle = getComputedStyle(element);
    const borderWidth = parseFloat(computedStyle.borderWidth);
    const borderColor = computedStyle.borderColor;
    const borderStyle = computedStyle.borderStyle;

    element.style.border = "none"; // Crucial: Remove native border

    let filters = [];

    // Add filter for the border if present
    if (borderWidth > 0 && borderStyle !== "none") {
      filters.push(`drop-shadow(0 0 0 ${borderWidth}px ${borderColor})`);
    }

    // --- Handle Box-Shadow (for :active, :focus-visible, etc.) ---
    const currentBoxShadow = computedStyle.boxShadow;

    if (currentBoxShadow && currentBoxShadow !== "none") {
      const dropShadows =
        this._parseBoxShadowAndConvertToDropShadow(currentBoxShadow);
      filters.push(...dropShadows); // Add parsed drop shadows to the filters array
    }

    // Apply all combined filters
    element.style.filter =
      filters.length > 0 ? filters.join(" ") : data.initialFilter || "none";
  }

  // Renamed to avoid confusion with original updateSquircle
  _updateSquircle(element) {
    this._applySquircleStyles(element); // Re-apply all styles
  }

  _parseBoxShadowAndConvertToDropShadow(boxShadowString) {
    const shadows = boxShadowString.split(/,\s*(?![^()]*\))/);
    let dropShadows = [];

    shadows.forEach((shadow) => {
      const parts = shadow
        .trim()
        .match(
          /(-?\d+\.?\d*px)\s+(-?\d+\.?\d*px)\s+(-?\d+\.?\d*px)(?:\s+(-?\d+\.?\d*px))?\s*(.+)/,
        );

      if (parts) {
        const offsetX = parts[1];
        const offsetY = parts[2];
        const blurRadius = parts[3];
        const spreadRadius = parts[4] || "0px";
        const color = parts[5];

        if (offsetX === "0px" && offsetY === "0px" && blurRadius === "0px") {
          dropShadows.push(`drop-shadow(0 0 ${spreadRadius} ${color})`);
        } else {
          dropShadows.push(
            `drop-shadow(${offsetX} ${offsetY} ${blurRadius} ${color})`,
          );
        }
      }
    });
    return dropShadows;
  }

  // --- END: Helper functions ---
}

// Initialize the renderer
const squircleModule = new SquircleRenderer();
squircleModule.init();
