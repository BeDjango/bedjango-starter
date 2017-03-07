var CDocParser = require('cdocparser');

/**
 * Extract the code following `offset` in `code` buffer,
 * delimited by braces.
 *
 * `offset` should be set to the position of the opening brace. If not,
 * the function will jump to the next opening brace.
 *
 * @param {String} code Code buffer.
 * @param {Number} offset Index of the opening brace.
 * @return {String} Extracted code between braces.
 */
var extractCode = function (code, offset) {
  offset = offset || 0;

  if (code[offset] !== '{') {
    // The position is not valid, jump to next opening brace
    offset = code.indexOf('{', offset);
  }

  var start = offset + 1; // Ignore the opening brace
  var cursor = start;
  var depth = 1; // The opening brace is consumed
  var length = code.length;

  var inString = false;
  var openChar = '';

  // In block comment (line comments are instantly consumed)
  var inComment = false;

  while (cursor < length && depth > 0) {
    var cb = code[cursor - 1]; // Char before
    var c = code[cursor]; // Char
    var cn = code[cursor + 1]; // Char next

    if (!inString) {
      if (c === '/' && cn === '/' && !inComment) {
        // Swallow line comment
        cursor = Math.min(
          Math.max(code.indexOf('\r', cursor), code.indexOf('\n', cursor)),
          length
        );
        continue;
      } else if (c === '/' && cn === '*') {
        // Block comment: begin
        cursor += 2; // Swallow opening
        inComment = true;
        continue;
      } else if (c === '*' && cn === '/') {
        // Block comment: end
        cursor += 2; // Swallow closing
        inComment = false;
        continue;
      }
    }

    if (!inComment) {
      if ((c === '"' || c === '\'') && cb !== '\\') {
        if (!inString) {
          // String: begin
          openChar = c;
          inString = true;
          cursor++;
          continue;
        } else if (openChar === c) {
          // String: end
          inString = false;
          cursor++;
          continue;
        }
      }
    }

    if (!(inString || inComment)) {
      if (c === '{') {
        depth++;
      } else if (c === '}') {
        depth--;
      }
    }

    cursor++;
  }

  if (depth > 0) {
    return '';
  }

  // Ignore the closing brace
  cursor--;

  return code.substring(start, cursor);
};

var findCodeStart = function(ctxCode, lastMatch){
  var codeStart = ctxCode.indexOf('{', lastMatch);
  if (codeStart < 0 || ctxCode[codeStart-1] !== '#') {
    return codeStart;
  }
  return findCodeStart(ctxCode, codeStart+1);
};

var addCodeToContext = function(context, ctxCode, match){
  var codeStart = findCodeStart(ctxCode, match.index);
  if (codeStart >= 0) {
    context.code = extractCode(ctxCode, codeStart);
    return codeStart + context.code.length + 1; // Add closing brace!
  }
};

/**
 * SCSS Context Parser
 */
var scssContextParser = (function () {
    var ctxRegEx = /^(@|%|\$)([\w-_]+)*(?:\s+([\w-_]+)|[\s\S]*?\:([\s\S]*?)(?:\s!(\w+))?\;)?/;
    var parser = function (ctxCode, lineNumberFor) {
    var match = ctxRegEx.exec(ctxCode.trim());
    var startIndex, endIndex;

    var context = {
      type : 'unknown'
    };

    if (match) {
      var wsOffset = Math.min(ctxCode.match(/\s*/).length - 1, 0);
      startIndex = wsOffset + match.index;
      endIndex = startIndex + match[0].length;

      if (match[1] === '@' && (match[2] === 'function' || match[2] === 'mixin')) {
        context.type = match[2];
        context.name = match[3];
        endIndex = addCodeToContext(context, ctxCode, match);
      } else if (match[1] === '%') {
        context.type = 'placeholder';
        context.name = match[2];
        endIndex = addCodeToContext(context, ctxCode, match);
      } else if (match[1] === '$') {
        context.type = 'variable';
        context.name = match[2];
        context.value = match[4].trim();
        context.scope = match[5] || 'private';
      }
    } else {
      startIndex = findCodeStart(ctxCode, 0);
      endIndex = ctxCode.length - 1;
      if (startIndex > 0) {
        context.type = 'css';
        context.name = ctxCode.slice(0, startIndex).trim();
        context.value = extractCode(ctxCode, startIndex).trim();
      }
    }

    if (lineNumberFor !== undefined && startIndex !== undefined) {
      context.line = {
        start : lineNumberFor(startIndex) + 1,
        end : lineNumberFor(endIndex) + 1
      };
    }

    return context;
  };

  return parser;
})();

var filterAndGroup = function (lines) {
  var nLines = [];
  var group = false;
  lines.forEach(function (line){
    var isAnnotation = line.indexOf('@') === 0;
    if (line.trim().indexOf('---') !== 0) { // Ignore lines that start with "---"
      if (group){
        if ( isAnnotation ) {
          nLines.push(line);
        } else {
          nLines[nLines.length - 1] += '\n' + line ;
        }
      } else if (isAnnotation) {
        group = true;
        nLines.push(line);
      } else {
        nLines.push(line);
      }
    }
  });
  return nLines;
};

var extractor = new CDocParser.CommentExtractor(scssContextParser, { blockComment : false});

var Parser = function (annotations, config) {
  this.commentParser = new CDocParser.CommentParser(annotations, config);
};

Parser.prototype.parse = function (code, id){
  var comments = extractor.extract(code);
  comments.forEach(function (comment){
    comment.lines = filterAndGroup(comment.lines);
  });
  return this.commentParser.parse(comments, id);
};

Parser.prototype.contextParser = scssContextParser;
Parser.prototype.extractCode = extractCode;

module.exports = Parser;
