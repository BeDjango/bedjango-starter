'use strict';

exports.__esModule = true;
exports['default'] = return_;
var typeRegEx = /^\s*(?:\{(.*)\})?\s*(?:-?\s*([\s\S]*))?/;

function return_(env) {
  return {
    name: 'return',

    parse: function parse(text, info, id) {
      var parsed = typeRegEx.exec(text);
      var obj = {};

      if (parsed[1]) {
        obj.type = parsed[1];
      } else {
        env.logger.warn('@return must at least have a type. Location: ' + id + ':' + info.commentRange.start + ':' + info.commentRange.end);
        return undefined;
      }

      if (parsed[2]) {
        obj.description = parsed[2];
      }

      return obj;
    },

    alias: ['returns'],

    allowedOn: ['function'],

    multiple: false
  };
}

module.exports = exports['default'];