'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

exports.__esModule = true;

var SassDocError = (function (_Error) {
  _inherits(SassDocError, _Error);

  function SassDocError(message) {
    _classCallCheck(this, SassDocError);

    _Error.call(this, message);
    this.message = message; // rm when native class support.
  }

  _createClass(SassDocError, [{
    key: 'name',
    get: function get() {
      return 'SassDocError';
    }
  }]);

  return SassDocError;
})(Error);

exports.SassDocError = SassDocError;

var Warning = (function (_SassDocError) {
  _inherits(Warning, _SassDocError);

  function Warning(message) {
    _classCallCheck(this, Warning);

    _SassDocError.call(this, message);
    this.message = message; // rm when native class support.
  }

  _createClass(Warning, [{
    key: 'name',
    get: function get() {
      return 'Warning';
    }
  }]);

  return Warning;
})(SassDocError);

exports.Warning = Warning;