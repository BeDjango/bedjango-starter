'use strict';

var path = require('path');

/**
 * Figure out a shortcut icon, and whether it is external or a local
 * file to copy.
 *
 * You can specify a local or external URL in `ctx.shortcutIcon`.
 *
 * For a local file, it will be relative to `ctx.dir`.
 *
 * A `ctx.shortcutIcon` property is then created and will look like
 * this:
 *
 *     {
 *       "type": "external|internal",
 *       "url": "external URL or file base name",
 *       "path": "only for internal, file absolute path"
 *     }
 */
module.exports = function shortcutIcon(ctx) {
  var icon = ctx.shortcutIcon;

  if (!icon) {
    return;
  }

  if (/^([a-z]+:)?\/\//.test(icon)) {
    // External URL.
    ctx.shortcutIcon = {type: 'external', url: icon};
    return;
  }

  ctx.shortcutIcon = {
    type: 'internal',
    url: path.basename(icon),
    path: path.resolve(ctx.dir, icon),
  };
};
