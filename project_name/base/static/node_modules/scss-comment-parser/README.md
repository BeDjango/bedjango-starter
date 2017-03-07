scss-comment-parser [![Build Status](https://travis-ci.org/SassDoc/scss-comment-parser.svg?branch=master)](https://travis-ci.org/SassDoc/scss-comment-parser)
---

Parse `///` comments and extracts context from SCSS.


## Install

```shell
npm install --save scsscommentparser
```

## Usage

```js
var ScssCommentParser = require('scsscommentparser');

var annotations = {
  _: {
    alias: {
      'aliasTest': 'annotationTest'
    }
  },
  annotationTest: function ( commentLine ) {
    return 'Working';
  }
};

var parser = new ScssCommentParser( annotations );


var scss = /* Load Scss */
var comments = parser.parse ( scss );

console.log(comments);
```


## Changelog

#### `0.8.2`
  * Fix selectors with interpolations parsing.

#### `0.8.1`
  * Fix CSS line numbers, expected by SassDoc.

#### `0.8.0`
  * Allow CSS context parsing.

#### `0.7.0`
  * Update to `cdocparser@0.14.0`

#### `0.6.0`
  * Update to `cdocparser@0.13.0`
  * Make changes needed for SassDoc 2.0

#### `0.5.1-rc1`
  * Update to `cdocparser@0.5.0`
  * Add support for configuration passed to the extractor.  

#### `0.5.0`
  * Update to `cdocparser@0.4.0`
  * Add support for configuration passed to the extractor.  

#### `0.4.0`
  * Update to `cdocparser@0.3.0` supporting `///` comments
  * Include a `context.line` with `start, end` value for each detected code part

#### `0.3.2`
  * Added `context.code` to type `placeholder`.

#### `0.3.1`
  * Update to [`cdocparser`](https://github.com/FWeinb/CDocParser) 0.2.1

#### `0.3.0`
  * Add placeholder support (thanks to [callum](https://github.com/callum))

#### `0.2.4`
  * Remove first opening and last closing brace in `context.code`

#### `0.2.3`
  * Fixed wrong code extraction for `function` and `mixin`. (See [#11](https://github.com/SassDoc/scss-comment-parser/issues/11))

#### `0.2.2`
  * Added `context.code` to type `function` and `mixin` containing the whole code.

#### `0.2.1`
  * Fix bug in detection of comment blocks

#### `0.1.2`
  * Update dependencys

#### `0.1.1`
  * Fix multiline annotations to include `@`

#### `0.1.0`
  * Initial release
