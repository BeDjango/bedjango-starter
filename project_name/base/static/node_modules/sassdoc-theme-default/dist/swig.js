"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var assert = _interopRequire(require("assert"));

var chroma = _interopRequire(require("chroma-js"));

var Swig = require("swig").Swig;

var swigExtras = _interopRequire(require("swig-extras"));

var swigFilters = _interopRequire(require("swig/lib/filters"));

var swig = new Swig();
module.exports = swig;

swigExtras.useFilter(swig, "split");
swigExtras.useFilter(swig, "trim");
swigExtras.useFilter(swig, "groupby");

var safe = function (fn) {
  return fn.safe = true && fn;
};

var isColor = function (value) {
  try {
    chroma(value);
    return true;
  } catch (e) {
    return false;
  }
};

var displayAsType = function (input) {
  return input.split("|").map(function (x) {
    return x.trim();
  }).map(swigFilters.capitalize).join("</code> or <code>");
};

var yiq = function (_ref) {
  var _ref2 = _slicedToArray(_ref, 3);

  var red = _ref2[0];
  var green = _ref2[1];
  var blue = _ref2[2];
  return (red * 299 + green * 587 + blue * 114) / 1000;
};

var yiqContrast = function (rgb) {
  return yiq(rgb) >= 128 ? "#000" : "#fff";
};

var getChannel = function (start, hex) {
  return parseInt(hex.substr(start, 2), 16);
};

var hexToRgb = function (hex) {
  return [0, 2, 4].map(function (x) {
    return getChannel(x, hex);
  });
};

var colorToHex = function (color) {
  return chroma(color).hex().substr(1);
};

/**
 * Normalises a CSS color, then uses the YIQ algorithm to get the
 * correct contrast.
 *
 * @param {String} color
 * @return {String} `#000` or `#fff` depending on which one is a better.
 * @see {@link http://stackoverflow.com/questions/11867545/change-text-color-based-on-brightness-of-the-covered-background-area}
 */
var maybeYiqContrast = function (color) {
  return isColor(color) ? yiqContrast(hexToRgb(colorToHex(color))) : "#000";
};

swig.setFilter("in", function (key, object) {
  return key in object;
});
swig.setFilter("is_color", isColor);
swig.setFilter("display_as_type", safe(displayAsType));
swig.setFilter("yiq", maybeYiqContrast);
