'use strict';

exports.__esModule = true;
exports['default'] = content;

function content() {
  return {
    name: 'content',

    parse: function parse(text) {
      return text.trim();
    },

    autofill: function autofill(item) {
      if (!item.content && item.context.code.indexOf('@content') > -1) {
        return '';
      }
    },

    allowedOn: ['mixin'],

    multiple: false
  };
}

module.exports = exports['default'];