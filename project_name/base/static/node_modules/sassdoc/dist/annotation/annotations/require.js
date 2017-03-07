'use strict';

var _Array$find = require('babel-runtime/core-js/array/find')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _utils = require('../../utils');

var _lodashUniq = require('lodash.uniq');

var _lodashUniq2 = _interopRequireDefault(_lodashUniq);

var reqRegEx = /^\s*(?:\{(.*)\})?\s*(?:(\$?[^\s]+))?\s*(?:-?\s*([^<$]*))?\s*(?:<?\s*(.*)\s*>)?$/;

exports['default'] = function (env) {
  return {
    name: 'require',

    parse: function parse(text) {
      var match = reqRegEx.exec(text.trim());

      var obj = {
        type: match[1] || 'function',
        name: match[2]
      };

      obj.external = _utils.splitNamespace(obj.name).length > 1;

      if (obj.name.indexOf('$') === 0) {
        obj.type = 'variable';
        obj.name = obj.name.slice(1);
      }

      if (obj.name.indexOf('%') === 0) {
        obj.type = 'placeholder';
        obj.name = obj.name.slice(1);
      }

      if (match[3]) {
        obj.description = match[3].trim();
      }

      if (match[4]) {
        obj.url = match[4];
      }

      return obj;
    },

    autofill: function autofill(item) {
      var type = item.context.type;

      if (type === 'mixin' || type === 'placeholder' || type === 'function') {
        var _ret = (function () {
          var handWritten = undefined;

          if (item.require) {
            handWritten = {};

            item.require.forEach(function (reqObj) {
              handWritten[reqObj.type + '-' + reqObj.name] = true;
            });
          }

          var mixins = searchForMatches(item.context.code, /@include\s+([^(;$]*)/ig, isAnnotatedByHand.bind(null, handWritten, 'mixin'));

          var functions = searchForMatches(item.context.code, new RegExp('(@include)?\\s*([a-z0-9_-]+)\\s*\\(', 'ig'), // Literal destorys Syntax
          isAnnotatedByHand.bind(null, handWritten, 'function'), 2 // Get the second matching group instead of 1
          );

          var placeholders = searchForMatches(item.context.code, /@extend\s*%([^;\s]+)/ig, isAnnotatedByHand.bind(null, handWritten, 'placeholder'));

          var variables = searchForMatches(item.context.code, /\$([a-z0-9_-]+)/ig, isAnnotatedByHand.bind(null, handWritten, 'variable'));

          // Create object for each required item.
          mixins = mixins.map(typeNameObject('mixin'));
          functions = functions.map(typeNameObject('function'));
          placeholders = placeholders.map(typeNameObject('placeholder'));
          variables = variables.map(typeNameObject('variable'));

          // Merge all arrays.
          var all = [].concat(mixins, functions, placeholders, variables);

          // Merge in user supplyed requires if there are any.
          if (item.require && item.require.length > 0) {
            all = all.concat(item.require);
          }

          // Filter empty values.
          all = all.filter(function (x) {
            return x !== undefined;
          });

          if (all.length > 0) {
            all = _lodashUniq2['default'](all, 'name');

            // Filter the item itself.
            all = all.filter(function (x) {
              return !(x.name === item.context.name && x.type === item.context.type);
            });

            return {
              v: all
            };
          }
        })();

        // istanbul ignore next
        if (typeof _ret === 'object') return _ret.v;
      }
    },

    resolve: function resolve(data) {
      data.forEach(function (item) {
        if (item.require === undefined) {
          return;
        }

        item.require = item.require.map(function (req) {
          if (req.external === true) {
            return req;
          }

          var reqItem = _Array$find(data, function (x) {
            return x.context.name === req.name && x.context.type === req.type;
          });

          if (reqItem === undefined) {
            if (!req.autofill) {
              env.logger.warn('Item `' + item.context.name + '` requires `' + req.name + '` from type `' + req.type + '` but this item doesn\'t exist.');
            }

            return;
          }

          if (!Array.isArray(reqItem.usedBy)) {
            reqItem.usedBy = [];

            reqItem.usedBy.toJSON = function () {
              return reqItem.usedBy.map(function (item) {
                return {
                  description: item.description,
                  context: item.context
                };
              });
            };
          }

          reqItem.usedBy.push(item);
          req.item = reqItem;

          return req;
        }).filter(function (x) {
          return x !== undefined;
        });

        if (item.require.length > 0) {
          item.require.toJSON = function () {
            return item.require.map(function (item) {
              var obj = {
                type: item.type,
                name: item.name,
                external: item.external
              };

              if (item.external) {
                obj.url = item.url;
              } else {
                obj.description = item.description;
                obj.context = item.context;
              }

              return obj;
            });
          };
        }
      });
    },

    alias: ['requires']
  };
};

function isAnnotatedByHand(handWritten, type, name) {
  if (type && name && handWritten) {
    return handWritten[type + '-' + name];
  }

  return false;
}

function searchForMatches(code, regex, isAnnotatedByHandProxy) {
  var id = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

  var match = undefined;
  var matches = [];

  while (match = regex.exec(code)) {
    if (!isAnnotatedByHandProxy(match[id]) && (id <= 1 || match[id - 1] === undefined)) {
      matches.push(match[id]);
    }
  }

  return matches;
}

function typeNameObject(type) {
  return function (name) {
    if (name.length > 0) {
      return {
        type: type,
        name: name,
        autofill: true
      };
    }
  };
}
module.exports = exports['default'];