class SquircleRenderer {
  constructor() {
    this.observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => this.updateSquircle(entry.target));
    });
    this.elements = new Map(); // Store elements and their original border-radius
  }

  init() {
    // Find all elements with border-radius (simplified for example)
    document.querySelectorAll("[data-squircle-radius]").forEach((el) => {
      const borderRadius =
        el.dataset.squircleRadius || getComputedStyle(el).borderRadius;
      if (borderRadius) {
        this.elements.set(el, borderRadius);
        this.applySquircle(el, borderRadius);
        this.observer.observe(el);
      }
    });
  }

  applySquircle(element, borderRadius) {
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const radius = parseFloat(borderRadius);
    const smoothing = 1; // A configurable smoothing factor (0-1) - kept at 1 for strong squircle

    const pathData = this._generateSquirclePath(
      width,
      height,
      radius,
      smoothing,
    );

    // --- Handle Border ---
    // Get computed border styles
    const computedStyle = getComputedStyle(element);
    const borderWidth = parseFloat(computedStyle.borderWidth);
    const borderColor = computedStyle.borderColor;
    const borderStyle = computedStyle.borderStyle;

    // Apply clip-path
    // Using path() directly in CSS is more modern and often preferred over data URIs for simple paths
    element.style.clipPath = `path("${pathData}")`;
    element.style.borderRadius = "0"; // Remove original border-radius

    // Remove native border to avoid conflicts or double borders
    element.style.border = "none";

    // Apply drop-shadow for the squircle border effect
    // Only apply if there's a border and it's not 'none'
    if (borderWidth > 0 && borderStyle !== "none") {
      // drop-shadow arguments: offsetX offsetY blurRadius color
      // For a solid border, offsetX and offsetY are 0, and blurRadius is 0.
      // The color is the border color.
      element.style.filter = `drop-shadow(0 0 0 ${borderWidth}px ${borderColor})`;
    } else {
      element.style.filter = "none"; // Ensure no filter if no border is desired
    }
  }

  _generateSquirclePath(width, height, radius, smoothing) {
    const r = Math.min(radius, width / 2, height / 2);
    const s = Math.max(0, Math.min(1, smoothing));
    const k = 1 - 0.5522847498 * s;

    let path = ``;

    // Start at the bottom-left corner's curve start point
    path += `M ${r},${height}`;

    // Bottom edge to bottom-right corner
    path += `L ${width - r},${height}`;
    path += `C ${width - r * k},${height} ${width},${height - r * k} ${width},${height - r}`;

    // Right edge to top-right corner
    path += `L ${width},${r}`;
    path += `C ${width},${r * k} ${width - r * k},0 ${width - r},0`;

    // Top edge to top-left corner
    path += `L ${r},0`;
    path += `C ${r * k},0 0,${r * k} 0,${r}`;

    // Left edge to bottom-left corner (closing the path)
    path += `L 0,${height - r}`;
    path += `C 0,${height - r * k} ${r * k},${height} ${r},${height}`;

    path += `Z`;

    return path;
  }

  updateSquircle(element) {
    const originalRadius = this.elements.get(element);
    if (originalRadius) {
      this.applySquircle(element, originalRadius);
    }
  }
}

// Usage:
const squircleModule = new SquircleRenderer();
squircleModule.init();
