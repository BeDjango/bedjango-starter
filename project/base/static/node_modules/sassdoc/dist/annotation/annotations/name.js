'use strict';

exports.__esModule = true;
exports['default'] = access;

function access() {
  return {
    name: 'name',

    parse: function parse(text) {
      return text.trim();
    },

    // Abuse the autofill feature to rewrite the `item.context`
    autofill: function autofill(item) {
      if (item.name) {
        item.context.name = item.name;
        // Cleanup
        delete item.name;
      }
    },

    multiple: false
  };
}

module.exports = exports['default'];