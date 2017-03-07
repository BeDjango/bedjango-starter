'use strict';

exports.__esModule = true;
exports['default'] = link;
var linkRegex = /\s*([^:]+\:\/\/[^\s]*)?\s*(.*?)$/;

function link() {
  return {
    name: 'link',

    parse: function parse(text) {
      var parsed = linkRegex.exec(text.trim());

      return {
        url: parsed[1] || '',
        caption: parsed[2] || ''
      };
    },

    alias: ['source']
  };
}

module.exports = exports['default'];