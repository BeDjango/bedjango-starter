'use strict';

module.exports = function byType(data) {
  var sorted = {};

  data.forEach(function (item) {
    var type = item.context.type;

    if (!(type in sorted)) {
      sorted[type] = [];
    }

    sorted[type].push(item);
  });

  return sorted;
};
