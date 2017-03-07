"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var chroma = _interopRequire(require("chroma-js"));

var def = _interopRequire(require("../default"));

var Promise = require("es6-promise").Promise;

var denodeify = _interopRequire(require("es6-denodeify"));

var extend = _interopRequire(require("extend"));

var fs = _interopRequire(require("fs"));

var fse = _interopRequire(require("fs-extra"));

var minify = require("html-minifier").minify;

var path = _interopRequire(require("path"));

var sassdocExtras = _interopRequire(require("sassdoc-extras"));

var swig = _interopRequire(require("./swig"));

denodeify = denodeify(Promise);

var copy = denodeify(fse.copy);
var renderFile = denodeify(swig.renderFile);
var writeFile = denodeify(fs.writeFile);

var applyDefaults = function (ctx) {
  return extend({}, def, ctx, {
    groups: extend(def.groups, ctx.groups),
    display: extend(def.display, ctx.display) });
};

var shortcutIcon = function (dest, ctx) {
  if (!ctx.shortcutIcon) {
    ctx.shortcutIcon = { type: "internal", url: "assets/images/favicon.png" };
  } else if (ctx.shortcutIcon.type === "internal") {
    ctx.shortcutIcon.url = "assets/images/" + ctx.shortcutIcon.url;

    return function () {
      return copy(ctx.shortcutIcon.path, path.resolve(dest, ctx.shortcutIcon.url));
    };
  }
};

module.exports = function (dest, ctx) {
  ctx = applyDefaults(ctx);
  sassdocExtras(ctx, "description", "markdown", "display", "groupName", "shortcutIcon", "sort", "resolveVariables");
  ctx.data.byGroupAndType = sassdocExtras.byGroupAndType(ctx.data);

  var index = path.resolve(__dirname, "../views/documentation/index.html.swig");

  return Promise.all([copy(path.resolve(__dirname, "../assets"), path.resolve(dest, "assets")).then(shortcutIcon(dest, ctx)), renderFile(index, ctx).then(function (html) {
    return minify(html, { collapseWhitespace: true });
  }).then(function (html) {
    return writeFile(path.resolve(dest, "index.html"), html);
  })]);
};
