'use strict';

/**
 * Resolve variables aliases.
 */
module.exports = function resolveVariables(ctx) {
  var cache = {};

  ctx.data
    .filter(isVariable)
    .forEach(function (item) {
      cache[item.context.name] = item.context.value;
    });

  for (var item in cache) {
    var value = variableValue(cache[item]);

    if (value) {
      cache[item] = cache[value[1]];
    }
  }

  ctx.data
    .forEach(function (item) {
      if (isVariable(item)) {
        item.resolvedValue = cache[item.context.name];
      }

      if (item.property) {
        item.property.forEach(function (prop) {
          var value = variableValue(prop.default);

          prop.resolvedValue = value ? cache[value[1]] : prop.default;
        });
      }

      if (item.parameter) {
        item.parameter.forEach(function (param) {
          var value = variableValue(param.default);

          param.resolvedValue = value ? cache[value[1]] : param.default;
        });
      }
    });
};

/**
 * Test whether passed item is of type variable.
 * @param {Object} item
 * @return {Boolean}
 */
function isVariable(item) {
  return typeof item.context.type === 'string' &&
         item.context.type.toLowerCase() === 'variable';
}

/**
 * Test and extract variables key names.
 * @param {String} value
 * @return {Array | null}
 */
function variableValue(value) {
  return /^\s*\$([a-z0-9_-]+)$/i.exec(value);
}
