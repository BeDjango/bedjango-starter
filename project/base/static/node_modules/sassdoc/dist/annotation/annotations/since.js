'use strict';

exports.__esModule = true;
exports['default'] = since;
var sinceRegEx = /\s*([^\s]*)\s*(?:-?\s*([\s\S]*))?\s*$/;

function since() {
  return {
    name: 'since',

    parse: function parse(text) {
      var parsed = sinceRegEx.exec(text);
      var obj = {};

      if (parsed[1]) {
        obj.version = parsed[1];
      }

      if (parsed[2]) {
        obj.description = parsed[2];
      }

      return obj;
    }
  };
}

module.exports = exports['default'];