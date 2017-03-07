var assert = require('assert');
var docParser = require('..');

describe('Indexer', function () {
  var data = [
    { foo: 'a', context: { type: 'x' } },
    { foo: 'b', context: { type: 'y' } },
    { foo: 'b', context: { type: 'z' } }
  ];

  describe('#indexBy', function () {
    it('should index the data with given getter', function () {
      var indexByFoo = docParser.indexBy(function (x) {
        return x.foo;
      });

      var index = indexByFoo(data);

      assert.deepEqual(index, {
        'a': [
          { foo: 'a', context: { type: 'x' } }
        ],
        'b': [
          { foo: 'b', context: { type: 'y' } },
          { foo: 'b', context: { type: 'z' } }
        ]
      });
    });
  });

  describe('#indexByType', function () {
    var index = docParser.indexByType(data);

    assert.deepEqual(index, {
      'x': [ { foo: 'a', context: {type: 'x'} } ],
      'y': [ { foo: 'b', context: {type: 'y'} } ],
      'z': [ { foo: 'b', context: {type: 'z'} } ],
    });
  });
});
