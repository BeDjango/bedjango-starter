'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var stripIndent = require('strip-indent');
var extend = require('lodash.assign');
var escapeStringRegexp = require('escape-string-regexp');

/**
 * Index a buffer of text to give the byte offset for each line.
 *
 * @param {String} buffer
 * @return {Object} index
 */
function createIndex (buffer) {
  var indexData = {0: 0};

  for (var i = 0, length = buffer.length, line = 1; i < length; i++) {
    if (buffer[i] === '\n') {
      indexData[i + 1] = line;
      line += 1;
    }
  }

  return indexData;
}

/**
 * Extract all C-Style comments from the input code
 */
var CommentExtractor = (function () {

  /**
   * Create a RegExp to extract comments.
   *
   * @param {String} lineCommentStyle Characters we expect to see at the start of a line comment.
   * @param {String} blockCommentStyle Characters we expect to see at the start of a block comment.
   * @return {RegExp}
   */
  function createDocCommentRegExp (lineCommentStyle, blockCommentStyle) {
    var linePattern;
    if (lineCommentStyle) {
      linePattern =
          '^(?:[ \\t]*' +
          escapeStringRegexp(lineCommentStyle) +
          '.*\\S*[\\s]?)+$';
    }

    var blockPattern;
    if (blockCommentStyle) {
      blockPattern =
          '^[ \\t]*' +
          escapeStringRegexp(blockCommentStyle) +
          '((?:[^*]|\\n|(?:\\*+(?:[^*/]|\\n)))*)(\\*+)\\/';
    }


    var regex = linePattern;

    if (regex !== undefined && blockPattern !== undefined){
      regex += '|' + blockPattern;
    }

    if (regex === undefined) {
      regex = blockPattern;
    }

    return new RegExp(regex, 'gm');
  }

  /**
   * Create a RegExp for extracting the text of line comments.
   *
   * @param {String} lineCommentStyle Characters we expect to see at the start of a line comment.
   * @return {RegExp}
   */
  function createLineCommentRegExp (lineCommentStyle) {
    if (lineCommentStyle) {
      return new RegExp(escapeStringRegexp(lineCommentStyle) + '[\\/]*');
    }
    return null;
  }

  /**
   * Generate a function that will index a buffer of text
   * and return a line for a specify char index
   *
   * @param {String} buffer buffer that is indexed
   * @return {Function} Function that translates an char index to line number
   */
  function index(buffer) {
    var indexData = createIndex(buffer);

    return function (offset) {
      // offset 0 will always be the first line
      if (offset === 0) { return 0; }

      // exact match
      if (indexData[offset] !== undefined) { return indexData[offset]; }

      // step backwards until we find a newline
      for (var i = offset; i > 0 && buffer[i-1] != '\n'; i--);

      return indexData[i];
    };
  }

  var cleanBlockComment = function (comment) {
    var removeFirstLine = comment.replace(/^.*?\n+|\n.*?$/g, '');
    var removeLeadingStar = removeFirstLine.replace(/^[ \t]*\*/gm, '');
    return stripIndent(removeLeadingStar).split(/\n/);
  };

  var cleanLineComments = function (comment, lineCommentRegExp) {
    var type;
    var lines = comment.split(lineCommentRegExp);
    lines.shift();

    if (lines[0] !== undefined && comment.trim().indexOf('////') === 0){
      lines.shift(); // Remove line with stars
      type = 'poster';
    }

    var removedCommentChars = lines.join('').replace(/\n$/, '');

    // Remove indention and remove last element if empty
    lines = stripIndent(removedCommentChars).split('\n');

    return {
      lines : lines,
      type : type
    };
  };

  var unifyLineEndings = function (code) {
    return code.replace(/\r\n?|\n/g, '\n');
  };


  function CommentExtractor (parseContext, opts) {
    this.parseContext = parseContext;

    opts = opts || {};

    // Enable both line comments and block comments
    opts.lineComment  = opts.lineComment  === false ? false : true;
    opts.blockComment = opts.blockComment === false ? false : true;

    if (opts.lineComment === false && opts.blockComment === false) {
      throw new Error('At least one comment style has to be enabled.');
    }

    if (opts.lineComment && !opts.lineCommentStyle) {
      opts.lineCommentStyle = '///';
    }

    if (opts.blockComment && !opts.blockCommentStyle) {
      opts.blockCommentStyle = '/**';
    }

    this.opts = opts;

    this.docCommentRegEx = createDocCommentRegExp(opts.lineCommentStyle, opts.blockCommentStyle);
    this.lineCommentRegEx = createLineCommentRegExp(opts.lineCommentStyle);
  }

  /**
   * Extract all comments from `code`
   * The `this.contextParser` to extract the context of the comment
   * @return {Array} Array of comment object like `{ lines : [array of comment lines], context : [result of contextParser] }`
   */
  CommentExtractor.prototype.extract = function (code) {
    code = unifyLineEndings(code);

    var match;
    var comments = [];

    var lineNumberFor = index(code);

    // reset
    this.docCommentRegEx.lastIndex = 0;

    while ( (match = this.docCommentRegEx.exec(code)) ) {
      var commentType = 'block'; // Defaults to block comment
      var lines;
      // Detect if line comment or block comment
      if (match[1] === undefined){
        var lineObj = cleanLineComments(match[0], this.lineCommentRegEx);
        lines = lineObj.lines;
        commentType = lineObj.type || 'line';
      } else {
        lines = cleanBlockComment(match[1]);
        // If there are more than one stare
        if (match[2].length > 1) {
          commentType =  'poster';
        }
      }

      var endOffset = match.index + match[0].length;

      var lineNumberWithOffsetFor = function(offset){
        return lineNumberFor(endOffset + 1 + offset);
      };

      // Add 1 so we get 1-based values.
      var startLineNumber = lineNumberFor(match.index) + 1;

      // Exclude the final character as sometimes it will be a newline
      var endLineNumber = lineNumberFor(endOffset - 1) + 1;

      comments.push({
        lines: lines,
        type: commentType,
        commentRange: {
          start: startLineNumber,
          end: endLineNumber
        },
        context: this.parseContext(code.substr(endOffset), lineNumberWithOffsetFor)
      });
    }

    return comments;
  };

  return CommentExtractor;
})();

var isAnnotationAllowed = function (comment, annotation){
  if (comment.type !== 'poster' &&
      comment.context.type &&
      Array.isArray(annotation.allowedOn)) {
    return annotation.allowedOn.indexOf(comment.context.type) !== -1;
  }
  return true;
};

var shouldAutofill = function(name, config){
  if (config.autofill === undefined || config.autofill === true ){
    return true;
  }
  if (Array.isArray(config.autofill)){
    return config.autofill.indexOf(name) !== -1;
  }
  return false;
};

var isMultiple = function(annotation){
  return annotation.multiple === undefined || annotation.multiple === true;
};

var getContent = function(line, match){
  return line.substr(match.index + match[0].length).replace(/^[ \t]+|[ \t]+$/g,'');
};

/**
 * Capable of parsing comments and resolving @annotations
 */
var CommentParser = (function(){
  var annotationRegex = /^@(\w+)/;

  function CommentParser (annotations, config) {
    EventEmitter.call(this);
    this.annotations = annotations;

    this.config = config || {};

    // Translate autofill from alias to real names.
    if (Array.isArray(this.config.autofill)){
      this.config.autofill = this.config.autofill.map(function(name){
        return annotations._.alias[name] || name;
      });
    }
  }

  util.inherits(CommentParser, EventEmitter);

  var parseComment = function (comment, annotations, posterComment, id) {
    var parsedComment = {
      description: '',
      commentRange: comment.commentRange,
      context: comment.context
    };

    comment.lines.forEach(function (line) {
      var match = annotationRegex.exec(line);
      if (match) {
        var name = annotations._.alias[match[1]] || match[1]; // Resolve name from alias
        var annotation = annotations[name];

        if (annotation && annotation.parse){

          if (isAnnotationAllowed(comment, annotation)){

            var allowMultiple = isMultiple(annotation);

            if (allowMultiple){

              if (typeof parsedComment[name] === 'undefined') {
                parsedComment[name] = [];
              }

              // Parse the annotation.
              var result = annotation.parse(getContent(line, match), parsedComment, id);

              // If it is a boolean use the annotaion as a flag
              if ( result === false || result === true) {
                parsedComment[name] = result;
              } else if ( result !== undefined ) {
                parsedComment[name].push( result );
              }

            } else if (typeof parsedComment[name] === 'undefined'){
              parsedComment[name] = annotation.parse(getContent(line, match), parsedComment, id);
            } else {
              this.emit(
                'warning',
                new Error(
                  'Annotation `'+ name + '` is only allowed once per comment, second value will be ignored.' +
                  ((id) ? 'Location `' + id + ':' + comment.commentRange.start + ':' + comment.commentRange.end + '`' : '')
                )
              );
            }
          } else {
            this.emit(
              'warning',
              new Error(
                'Annotation `' + name + '` is not allowed on comment from type `' + comment.context.type + '`' +
                ((id) ? ' in `' + id + ':' + comment.commentRange.start + ':' + comment.commentRange.end + '`' : '') +
                '.'
              )
            );
          }

        } else { 
          this.emit(
            'warning',
            new Error(
              'Parser for annotation `' + match[1] + '` not found.' +
              ((id) ? ' Location: `' + id + ':' + comment.commentRange.start + ':' + comment.commentRange.end + '`' : '')
            )
          );
        }
      } else {
        parsedComment.description += line + '\n';
      }
    }, this);



    // Save this as the PosterComment
    if (comment.type === 'poster'){
      // Only allow one posterComment per file
      if (Object.keys(posterComment).length === 0){
        extend(posterComment, parsedComment);
      } else {
        this.emit(
          'warning',
          new Error(
            'You can\'t have more than one poster comment.' +
            ((id) ? ' Location: `' + id + ':' + comment.commentRange.start + ':' + comment.commentRange.end + '`' : '')
          )
        );
      }
      // Don't add poster comments to the output
      return null;
    } else {
      // Merge in posterComment annotations and overwrite each annotation of item if it was not set
      // do it only if the annotation is allowed on the parsedComment.context.type
      Object.keys(posterComment).forEach(function(key){
        if (parsedComment[key] === undefined &&
            isAnnotationAllowed(parsedComment, annotations[key])){
          parsedComment[key] = posterComment[key];
        }
      });
    }
    // Fill in defaults
    Object.keys(annotations).forEach(function (name){
      if ( name !== '_' ){
        var defaultFunc = annotations[name].default;
        var autofillFunc = annotations[name].autofill;
        if ( isAnnotationAllowed(comment, annotations[name]) ) {

          // Only use default if user hasn't used annotation
          if (defaultFunc && parsedComment[name] === undefined ) {
            var defaultValue = defaultFunc(parsedComment);
            if (defaultValue !== undefined) {
              parsedComment[name] = defaultValue;
            }
          }

          if (autofillFunc && shouldAutofill(name, this.config)) {
            var autofillValue = autofillFunc(parsedComment);
            if (autofillValue !== undefined) {
              parsedComment[name] = autofillValue;
            }
          }
        }
      }
    }, this);

    return parsedComment;
  };

  /**
   * Parse the comments returned by the CommentExtractor.
   * Generate data use in the view
   */
  CommentParser.prototype.parse = function (comments, id) {
    var result = [];
    var posterComment = {};
    var thisParseComment = parseComment.bind(this);

    comments.forEach(function (comment) {
      var parsedComment = thisParseComment(comment, this.annotations, posterComment, id);
      if (parsedComment !== null){
        result.push(parsedComment);
      }
    }, this);

    return result;
  };


  return CommentParser;
})();

/**
 * Create an indexer function using given getter to choose the key
 * to index on.
 *
 * @param {Function} getter
 * @return {Function}
 */
function indexBy(getter) {

  /**
   * Index given data.
   *
   * @param {Array} data
   * @return {Object}
   */
  return function indexer(data) {
    var index = {};

    data.forEach(function (comment) {
      var type = getter(comment);

      if (typeof index[type] === 'undefined') {
        index[type] = [];
      }

      index[type].push(comment);
    });

    return index;
  };
}

var indexByType = indexBy(function (comment) {
  return comment.context.type;
});

module.exports.CommentParser = CommentParser;
module.exports.CommentExtractor = CommentExtractor;
module.exports.createIndex = createIndex;
module.exports.indexBy = indexBy;
module.exports.indexByType = indexByType;
