'use strict';

var _Array$find = require('babel-runtime/core-js/array/find')['default'];

exports.__esModule = true;
exports['default'] = see;
var seeRegEx = /\s*(?:\{([\w-_]+)\}\s*)?(.*)/;

function see(env) {
  return {
    name: 'see',

    parse: function parse(text) {
      var match = seeRegEx.exec(text);

      var obj = {
        type: match[1] || 'function',
        name: match[2]
      };

      if (obj.name.indexOf('$') === 0) {
        obj.type = 'variable';
        obj.name = obj.name.slice(1);
      }

      if (obj.name.indexOf('%') === 0) {
        obj.type = 'placeholder';
        obj.name = obj.name.slice(1);
      }

      return obj;
    },

    resolve: function resolve(data) {
      data.forEach(function (item) {
        if (item.see === undefined) {
          return;
        }

        item.see = item.see.map(function (see) {
          var seeItem = _Array$find(data, function (x) {
            return x.context.name === see.name;
          });

          if (seeItem !== undefined) {
            return seeItem;
          }

          env.logger.warn('Item `' + item.context.name + '` refers to `' + see.name + '` from type `' + see.type + '` but this item doesn\'t exist.');
        }).filter(function (x) {
          return x !== undefined;
        });

        item.see.toJSON = function () {
          return item.see.map(function (item) {
            return {
              description: item.description,
              context: item.context
            };
          });
        };
      });
    }
  };
}

module.exports = exports['default'];