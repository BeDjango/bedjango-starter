'use strict';

module.exports = function byGroupAndType(data) {
  var sorted = {};

  data.forEach(function (item) {
    var group = item.group[0];
    var type = item.context.type;

    if (!(group in sorted)) {
      sorted[group] = {};
    }

    if (!(type in sorted[group])) {
      sorted[group][type] = [];
    }

    sorted[group][type].push(item);
  });

  return sorted;
};
