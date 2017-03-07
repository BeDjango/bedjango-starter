'use strict';

/**
 * Compute a `display` property in regards of `display.access`
 * configuration.
 */
module.exports = function display(ctx) {
  ctx.data = ctx.data.filter(function (item) {
    var displayItemAccess = ctx.display.access ? (ctx.display.access.indexOf(item.access) !== -1) : false;
    var isAlias = item.alias;
    var displayAlias = ctx.display.alias;

    return displayItemAccess && !(isAlias && !displayAlias);
  });
};
