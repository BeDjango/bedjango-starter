'use strict';

exports.__esModule = true;
exports['default'] = parameter;
var typeRegEx = /^\s*(?:\{(.*)\})?\s*(?:\$?([^\s^\]\[]+))?\s*(?:\[([^\]]*)\])?\s*(?:-?\s*([\s\S]*))?/;

function parameter(env) {
  return {
    name: 'parameter',

    parse: function parse(text, info, id) {
      var parsed = typeRegEx.exec(text);
      var obj = {};

      if (parsed[1]) {
        obj.type = parsed[1];
      }

      if (parsed[2]) {
        obj.name = parsed[2];
      } else {
        env.logger.warn('@parameter must at least have a name. Location: ' + id + ':' + info.commentRange.start + ':' + info.commentRange.end);
        return undefined;
      }

      if (parsed[3]) {
        obj['default'] = parsed[3];
      }

      if (parsed[4]) {
        obj.description = parsed[4];
      }

      return obj;
    },

    alias: ['arg', 'argument', 'arguments', 'param', 'parameters'],

    allowedOn: ['function', 'mixin']
  };
}

module.exports = exports['default'];