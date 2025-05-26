const fs = require("fs");

function saveMap(outputMap) {
  // Save the output map to a JSON file
  fs.writeFileSync("_classMap.json", JSON.stringify(outputMap, null, 2));
}

module.exports = {
  plugins: {
    "postcss-rename": {
      strategy: "minimal",
      by: "whole",
      except: [
        "active",
        "show",
        "nav-item",
        "nav-link",
        "a",
        "dropdown",
        "dropdown-toggle",
        "dropdown-menu",
        "dropdown-item",
        "aria-expanded",
        "collapsed",
        "collapse",
        "transition",
        "collapsing",
        "overflow-hidden",
        "height",
        "position-relative",
      ],
      outputMapCallback: saveMap,
    },
  },
};
