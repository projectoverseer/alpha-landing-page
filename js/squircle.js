class SquircleRenderer {
  constructor() {
    this.observer = new ResizeObserver((entries) => {
      // Ensure we only update elements that are still managed by the renderer
      entries.forEach((entry) => {
        if (this.elements.has(entry.target)) {
          this._updateSquircle(entry.target);
        }
      });
    });
    this.elements = new Map(); // Store elements and their original styles
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
   * Tagged template literal to format numbers in SVG paths to 8 decimal places.
   * @param {TemplateStringsArray} strings
   * @param {...number[]} values
   * @returns {string} Formatted SVG path segment
   */
  static _rounded(strings, ...values) {
    return strings.reduce((acc, str, i) => {
      const value = values[i];
      if (typeof value === "number") {
        return acc + str + value.toFixed(8);
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
    const startX = SquircleRenderer._rounded`${width - topRightPathParams.p}`;
    const startY = SquircleRenderer._rounded`0`;

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

    const L4X = SquircleRenderer._rounded`0`;
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

  /**
   * Initializes the SquircleRenderer by finding elements and setting up observers.
   */
  init() {
    document.querySelectorAll("[data-squircle-radius]").forEach((el) => {
      const initialComputedStyle = getComputedStyle(el);
      const initialBorderRadius = initialComputedStyle.borderRadius;

      // Only store originalBorderRadius as other styles are no longer needed
      this.elements.set(el, {
        originalBorderRadius: initialBorderRadius,
      });

      this._applySquircleStyles(el);
      this.observer.observe(el);
    });

    // Specific Bootstrap dropdown handling: Re-apply squircle when dropdown is shown
    document.addEventListener("shown.bs.dropdown", (e) => {
      const dropdownMenu = e.target.querySelector(
        ".dropdown-menu[data-squircle-radius]",
      );
      if (dropdownMenu && this.elements.has(dropdownMenu)) {
        this._applySquircleStyles(dropdownMenu);
      }
    });
  }

  /**
   * Applies the squircle clip-path.
   * @param {HTMLElement} element The element to apply squircle styles to.
   */
  _applySquircleStyles(element) {
    const data = this.elements.get(element);
    if (!data) return;

    const { originalBorderRadius } = data;

    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const radius = parseFloat(originalBorderRadius);
    const cornerSmoothing = 1;

    // Skip if dimensions or radius are invalid
    if (isNaN(radius) || radius <= 0 || width <= 0 || height <= 0) {
      console.warn(
        "Invalid dimensions or radius for squircle element (skipping squircle application):",
        element,
        { width, height, radius },
      );
      // Revert to original styles if squircle cannot be applied
      element.style.clipPath = "none";
      element.style.borderRadius = originalBorderRadius;
      console.log(`--- Squircle Apply Skipped ---`);
      return;
    }

    const cornerParams = SquircleRenderer._getPathParamsForCorner({
      cornerRadius: radius,
      cornerSmoothing: cornerSmoothing,
      preserveSmoothing: true,
      roundingAndSmoothingBudget: Math.min(width, height) / 2,
    });

    const pathData = SquircleRenderer._getSVGPathFromPathParams({
      width,
      height,
      topLeftPathParams: cornerParams,
      topRightPathParams: cornerParams,
      bottomLeftPathParams: cornerParams,
      bottomRightPathParams: cornerParams,
    });

    element.style.clipPath = `path("${pathData}")`;
    element.style.borderRadius = "0"; // Always remove native border-radius
  }

  /**
   * Callback for ResizeObserver. Re-applies squircle styles on element resize.
   * @param {HTMLElement} element
   */
  _updateSquircle(element) {
    this._applySquircleStyles(element); // Re-apply all styles
  }
}

// Initialize the renderer when the DOM is ready
const squircleModule = new SquircleRenderer();
squircleModule.init();
