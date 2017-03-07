'use strict';

exports.__esModule = true;
exports['default'] = access;

function access(env) {

  var defaultPrivatePrefixTest = RegExp.prototype.test.bind(/^[_-]/);

  return {
    name: 'access',

    parse: function parse(text) {
      return text.trim();
    },

    autofill: function autofill(item) {
      if (item.access !== 'auto') {
        return;
      }

      if (env.privatePrefix === false) {
        return;
      }

      var testFunc = defaultPrivatePrefixTest;

      if (typeof env.privatePrefix !== 'undefined') {
        testFunc = RegExp.prototype.test.bind(new RegExp(env.privatePrefix));
      }

      if (testFunc(item.context.name)) {
        return 'private';
      }

      return 'public';
    },

    resolve: function resolve(data) {
      data.forEach(function (item) {
        // Ensure valid access when not autofilled.
        if (item.access === 'auto') {
          item.access = 'public';
        }
      });
    },

    'default': function _default() {
      return 'auto';
    },

    multiple: false
  };
}

module.exports = exports['default'];