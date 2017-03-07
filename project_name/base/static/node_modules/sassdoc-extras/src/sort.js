'use strict';

/**
 * Sort the SassDoc data by given criteria.
 * configuration.
 */
module.exports = function display(ctx) {
  if (!ctx.sort) {
    return;
  }

  ctx.data = ctx.data.sort(compareData(ctx.sort));
};

/**
 * Get a comparison function for given sort criteria.
 *
 * @param {Array} sort
 * @return {Function}
 */
function compareData(sort) {
  return function (a, b) {
    for (var i = 0; i < sort.length; ++i) {
      var parts = parseCriteria(sort[i]);
      var key = parts[0];
      var desc = parts[1];

      var comparison = compare(
        getComparisonValue(key, a),
        getComparisonValue(key, b)
      );

      if (desc) {
        comparison = invert(comparison);
      }

      if (comparison) {
        return comparison;
      }
    }

    return 0;
  };
}

function getComparisonValue(key, item) {
  switch (key) {
    case 'group': return item.group[0].toLowerCase();
    case 'file': return item.file.path;
    case 'line': return item.context.line.start;
    case 'access': return parseAccess(item.access);
    default: throw new Error('Unknown sort criteria `' + key + '`');
  }
}

function parseAccess(access) {
  switch (access) {
    case 'public': return 1;
    case 'private': return 2;
    default: return 3;
  }
}

function parseCriteria(key) {
    var last = key[key.length - 1];
    var invert = false;

    if (last === '<' || last === '>') {
      key = key.substr(0, key.length - 1);
    }

    if (last === '>') {
      invert = true;
    }

    return [key, invert];
}

function invert(comparison) {
  return !comparison ? 0 : -1 * comparison;
}

function compare(a, b) {
  switch (true) {
    case a > b: return 1;
    case a === b: return 0;
    default: return -1;
  }
}
