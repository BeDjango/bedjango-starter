/**
 * `@example` is a multiline annotation.
 *
 * Check if there is something on the first line and use it as the type information.
 *
 * @example html - description
 * <div></div>
 */

'use strict';

exports.__esModule = true;
exports['default'] = example;
var stripIndent = require('strip-indent');
var descRegEx = /(\w+)\s*(?:-?\s*(.*))/;

function example() {
  return {
    name: 'example',

    parse: function parse(text) {
      var instance = {
        type: 'scss', // Default to `scss`.
        code: text
      };

      // Get the optional type info.
      var optionalType = text.substr(0, text.indexOf('\n'));

      if (optionalType.trim().length !== 0) {
        var typeDesc = descRegEx.exec(optionalType);
        instance.type = typeDesc[1];
        if (typeDesc[2].length !== 0) {
          instance.description = typeDesc[2];
        }
        instance.code = text.substr(optionalType.length + 1); // Remove the type
      }

      // Remove all leading/trailing line breaks.
      instance.code = instance.code.replace(/^\n|\n$/g, '');

      instance.code = stripIndent(instance.code);

      return instance;
    }
  };
}

module.exports = exports['default'];