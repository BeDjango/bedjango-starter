'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _annotations = require('./annotations');

var _annotations2 = _interopRequireDefault(_annotations);

var AnnotationsApi = (function () {
  function AnnotationsApi(env) {
    _classCallCheck(this, AnnotationsApi);

    this.env = env;

    this.list = {
      _: { alias: {} }
    };

    this.addAnnotations(_annotations2['default']);
  }

  /**
   * Add a single annotation by name
   * @param {String} name - Name of the annotation
   * @param {Object} annotation - Annotation object
   */

  AnnotationsApi.prototype.addAnnotation = function addAnnotation(name, annotation) {
    // istanbul ignore next

    var _this = this;

    annotation = annotation(this.env);

    this.list._.alias[name] = name;

    if (Array.isArray(annotation.alias)) {
      annotation.alias.forEach(function (aliasName) {
        _this.list._.alias[aliasName] = name;
      });
    }

    this.list[name] = annotation;
  };

  /**
   * Add an array of annotations. The name of the annotations must be
   * in the `name` key of the annotation.
   * @param {Array} annotations - Annotation objects
   */

  AnnotationsApi.prototype.addAnnotations = function addAnnotations(annotations) {
    // istanbul ignore next

    var _this2 = this;

    if (annotations !== undefined) {
      annotations.forEach(function (annotation) {
        _this2.addAnnotation(annotation().name, annotation);
      });
    }
  };

  return AnnotationsApi;
})();

exports['default'] = AnnotationsApi;
module.exports = exports['default'];