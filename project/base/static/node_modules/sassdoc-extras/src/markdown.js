'use strict';

var marked = require('marked');

module.exports = function markdown(ctx) {

  /**
   * Wrapper for `marked` that takes only one argument to avoid
   * problem with `map` additional arguments.
   */
  function md(str) {
    return marked(str);
  }

  /**
   * Return a function that will apply `fn` on `obj[key]` to generate
   * `obj[newKey]`.
   */
  function applyKey(fn, key) {
    return function (obj) {
      if (key in obj) {
        obj[key] = fn(obj[key]);
      }

      return obj;
    };
  }

  if (ctx.package && ctx.package.description) {
    ctx.package.description = md(ctx.package.description);
  }

  if (ctx.description) {
    ctx.description = md(ctx.description);
  }

  ctx.data.forEach(function (item) {
    if ('description' in item) {
      item.description = marked(item.description);
    }

    if ('output' in item) {
      item.output = marked(item.output);
    }

    if ('content' in item && item.content.description) {
      item.content.description = marked(item.content.description);
    }

    if ('return' in item && item.return.description) {
      item.return.description = marked(item.return.description);
    }

    if ('deprecated' in item) {
      item.deprecated = marked(item.deprecated);
    }

    if ('author' in item) {
      item.author = item.author.map(md);
    }

    if ('throw' in item) {
      item.throw = item.throw.map(md);
    }

    if ('todo' in item) {
      item.todo = item.todo.map(md);
    }

    if ('example' in item) {
      item.example = item.example.map(
        applyKey(md, 'description')
      );
    }

    if ('parameter' in item) {
      item.parameter = item.parameter.map(
        applyKey(md, 'description')
      );
    }

    if ('property' in item) {
      item.property = item.property.map(
        applyKey(md, 'description')
      );
    }

    if ('since' in item) {
      item.since = item.since.map(
        applyKey(md, 'description')
      );
    }
  });
};
