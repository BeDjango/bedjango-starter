var fs = require('fs');
var assert = require("assert");
var docParser = require('../');

describe('CDocParser', function(){

  var createExtractor = function(opts){
    return new docParser.CommentExtractor( function (){ return { type : 'testCtx'}; }, opts );
  };

  var extractor = createExtractor();

  var getCommentsFrom = function(file, opts){
    if (opts){
      return createExtractor(opts).extract(fs.readFileSync(__dirname + '/fixtures/'+file, 'utf-8'));
    }
    return extractor.extract(fs.readFileSync(__dirname + '/fixtures/'+file, 'utf-8'));
  };

  describe('Index', function(){
    it('should index the offsets of the start of each line', function(){
      var index = docParser.createIndex(fs.readFileSync(__dirname + '/fixtures/block.test.scss', 'utf-8'));
      assert.equal(index[0], 0, 'First line starts at offset 0');
      assert.equal(index[4], 1, 'Second line starts at offset 4');
    });
  });

  describe('CommentExtractor', function(){
    describe('#extract', function(){
      describe('Block comments', function(){
        it('should extract block comments', function(){
          var comments = getCommentsFrom('block.test.scss');
          assert.equal(comments.length, 2);
          assert.equal(comments[0].lines.length, 3);
          assert.equal(comments[0].context.type, 'testCtx');
          assert.deepEqual(comments[0].lines, ['', 'Block comment test', '']);
          assert.deepEqual(comments[0].commentRange, { start: 1, end: 5 });
          assert.deepEqual(comments[1].lines, ['', 'Block comment test 2', '']);
          assert.deepEqual(comments[1].commentRange, { start: 7, end: 11 });
        });

        it('should not split every "*"', function(){
          var comments = getCommentsFrom('blockSplitCorrect.test.scss');
          assert.deepEqual(comments[0].lines, [ '@param {*} $list - list to purge', 'Test', 'Test']);
        });

        it('should ignore block comments like /* comment */', function(){
          var comments = getCommentsFrom('blockNested.test.scss');
          assert.equal(comments.length, 2);
        });

        it('should normalize the indentation', function(){
          var comments = getCommentsFrom('blockIndentation.test.scss');
          assert.deepEqual(comments[0].lines, ['test', '   hello', '  world']);
        });

        it('should not extract block comments if disabled', function(){
          var comments = getCommentsFrom('blockIndentation.test.scss', {blockComment : false});
          assert.equal(comments.length, 0);
        });

      });

      describe('Line comments', function(){
        it('should extract line comments', function (){
          var comments = getCommentsFrom('line.test.scss');
          assert.equal(comments.length, 2);
          assert.deepEqual(comments[0].lines, ['More', '', 'than', 'one', 'line']);
          assert.deepEqual(comments[0].commentRange, { start: 1, end: 5 });
          assert.deepEqual(comments[1].lines, ['More', 'than', 'one','comment']);
          assert.deepEqual(comments[1].commentRange, { start: 7, end: 10 });
        });

        it('should ignore block comments in line comments', function(){
          var comments = getCommentsFrom('lineIgnoreBlock.test.scss');
          assert.equal(comments.length, 1);
          assert.deepEqual(comments[0].lines, ['', '/**  test*/', '']);
        });

        it('should normalize the indentation', function(){
          var comments = getCommentsFrom('lineIndentation.test.scss');
          assert.deepEqual(comments[0].lines, ['', 'test', '   hello', '  world', '']);
        });

        it('should extract line commments with leading spaces', function(){
          var comments = getCommentsFrom('lineIndentionBefore.test.scss');
          assert.deepEqual(comments[0].lines, [ 'Just a test', '   ' ]);
          assert.deepEqual(comments[0].type, 'poster');
        });

        it('should not extract line comments if disabled', function(){
          var comments = getCommentsFrom('lineIndentionBefore.test.scss', {lineComment : false});
          assert.equal(comments.length, 0);
        });

        it('should not parse line poster inside strings', function () {
          var comments = getCommentsFrom('linePosterStart.test.scss');
          assert.deepEqual(comments, [{
            lines: [ 'Only this poster comment!' ],
            type: 'poster',
            commentRange: { start: 1, end: 3 },
            context: { type: 'testCtx' }
          }]);
        });

      });

      describe('Mixed style comments', function(){
        it('should extract comments', function (){
          var comments = getCommentsFrom('mixed.test.scss');
          assert.equal(comments.length, 3);
          assert.deepEqual(comments[0].lines, ['', 'Block comment test', '']);
          assert.deepEqual(comments[1].lines, ['', 'Line comment test', '']);
          assert.deepEqual(comments[2].lines, ['Single line test']);
          assert.deepEqual(comments[2].commentRange, { start: 14, end: 14 });
        });

        it('should either have line or block comments', function(){
          var commentsBlock = getCommentsFrom('mixed.test.scss', {lineComment : false});
          assert.equal(commentsBlock.length, 1);
          assert.deepEqual(commentsBlock[0].lines, ['', 'Block comment test', '']);

          var commentsLine = getCommentsFrom('mixed.test.scss', {blockComment : false});
          assert.equal(commentsLine.length, 2);
          assert.deepEqual(commentsLine[1].lines, ['Single line test']);
          assert.deepEqual(commentsLine[1].commentRange, { start: 14, end: 14 });
        });

      });

      describe('Block comment spanning a single line', function(){
        it('should extract comments', function (){
          var comments = getCommentsFrom('singleLineBlock.test.scss');
          assert.equal(comments.length, 1);
          assert.deepEqual(comments[0].lines, ['block comment on a single line']);
          assert.deepEqual(comments[0].commentRange, { start: 1, end: 1 });
        });
      });

      describe('Custom comment regex', function(){
        it('should extract comments', function (){
          var extractor = new docParser.CommentExtractor( function (){}, {
            lineCommentStyle: '//',
            blockCommentStyle: '/*'
          });

          var getCommentsFrom = function(file){
            return extractor.extract(fs.readFileSync(__dirname + '/fixtures/'+file, 'utf-8'));
          };

          var comments = getCommentsFrom('custom-regex.test.scss');

          assert.equal(comments.length, 2);
          assert.deepEqual(comments[0].lines, ['Block comment test', '']);
          assert.deepEqual(comments[0].commentRange, { start: 1, end: 5 });

          assert.deepEqual(comments[1].lines, ['Single line test']);
          assert.deepEqual(comments[1].commentRange, { start: 7, end: 7 });
        });
      });


      describe('Error on both disabled', function(){
        it('should throw an error if both styles are disabled', function (){
          try{
            var extractor = new docParser.CommentExtractor( function (){}, {
              lineComment: false,
              blockComment: false
            });
          } catch (e) {
            assert.equal(e+'', 'Error: At least one comment style has to be enabled.');
          }
        });
      });

    });
  });




  describe('CommentParser', function(){

    var parser;

    // Test comments
    var comments = [
      { lines : ['test', 'test', '@test'], commentRange : { start : 1, end :3 }, context : { type : 'testType1'} },
      { lines : ['test', 'test', ' @test'], commentRange : { start : 1, end :3 }, context : { type : 'testType1'} },
      { lines : ['test', '@ignore ingore this', 'test', '@ignore ingore this'], commentRange : { start : 1, end :3 }, context : { type : 'testType1'} },
      { lines : ['test', 'test', '@aliasTest'], commentRange : { start : 1, end :3 }, context : { type : 'testType2'} },
      { lines : ['test', 'test', '@test'], commentRange : { start : 1, end :3 }, context : { type : 'testType2'} },
      { lines : ['test', 'test', '@test'], commentRange : { start : 1, end :3 }, context : { type : 'testType3'} },
      { lines : ['test', 'test', '@flag'], commentRange : { start : 1, end :3 }, context : { type : 'testType3'} },
      { lines : ['@multiline\nThis is a\nmultiline\nannotation\n'], commentRange : { start : 1, end :3 }, context : { type : 'testType3'} }
    ];

    // Test Annotations
    var annotations = {
      _ : {
        alias : {
          "aliasTest" : "test"
        }
      },
      ignore : {
        parse : function() {}
      },
      test : {
        parse : function ( commentLine ){
          return "Working";
        },
        default : function(){
          return ["Default"];
        }
      },
      flag : {
        parse : function(){
          return true;
        }
      },
      multiline : {
        parse : function(commentLine){
          return commentLine;
        }
      },
      allowedLimited : {
        parse : function(){},
        allowedOn : ['workingType']
      }
    };


    beforeEach(function(){
      parser = new docParser.CommentParser( annotations );
    });


    describe('#parse', function(){
      it('should group comments by context type', function(){
       var result = parser.parse ( comments );
           assert.equal(result.length , 8);
      });

      it('should add default values', function(){
       var result = parser.parse ( comments );
            assert.equal(result[1].test[0] , 'Default' );
      });

      it('should join lines without annotation into description', function(){
       var result = parser.parse ( comments );
           assert.equal(result[0].description , 'test\ntest\n');
      });

      it('should resolve a alias to the real name', function(){
       var result = parser.parse ( comments );
           assert.equal(result.length , 8);
           assert.equal(result[0].test[0] , 'Working' );
      });

      it('should convert an annotation that returns a boolean to a flag', function(){
       var result = parser.parse ( comments );
            assert.equal(result[6].flag , true );
      });

      it('should parse a multiline annotation', function(){
       var result = parser.parse ( comments );
            assert.equal(result[7].multiline[0] , "\nThis is a\nmultiline\nannotation\n");
      });

      it('should ignore annotations that aren\'t at the start of the line', function(){
       var result = parser.parse ( comments );
            assert.equal(result[1].test[0] , 'Default');
      });

      it('should ignore annotations that won\'t return anything', function(){
       var result = parser.parse ( comments );
            assert.deepEqual(result[2].ignore , []);
      });

      it('should emit an error if annotation was not found', function(done){
        parser.on('warning', function(err){
          assert.equal(err + '', 'Error: Parser for annotation `notFound` not found.');
          done();
        });
        var result = parser.parse ( [{ lines : ['@notFound'], context : { type : 'testType1'}, commentRange : { start : 1, end : 3} }] );
      });

      it('should emit an error if annotation was not found and have ctx', function(done){
        parser.on('warning', function(err){
          assert.equal(err + '', 'Error: Parser for annotation `notFound` not found. Location: `file.scss:1:3`');
          done();
        });
        var result = parser.parse ( [{ lines : ['@notFound'], context : { type : 'testType1'}, commentRange : { start : 1, end : 3} }], 'file.scss' );
      });

      it('should apply annotations in a block poster comment to each item', function () {
        var comments = getCommentsFrom('blockPoster.test.scss');
        var result = parser.parse ( comments );
        assert.equal(result.length  , 2);
        assert.equal(result[0].flag , undefined);
        assert.equal(result[1].flag , true);
      });

      it('should apply annotations in a line poster comment to each item', function () {
        var comments = getCommentsFrom('linePoster.test.scss');
        var result = parser.parse ( comments );
        assert.equal(result.length  , 2);
        assert.equal(result[0].flag , undefined);
        assert.equal(result[1].flag , true);
      });

      it('should emit an error if more than one poster comment was used', function(done){
        var comments = extractor.extract('/**\n * Poster Comment\n **/ \n\n\n /**\n * Poster Comment\n **/');

        parser.on('warning', function(err){
          assert.equal(err + '', 'Error: You can\'t have more than one poster comment.');
          done();
        });
        var result = parser.parse (comments);
      });

      it('should emit an error if more than one poster comment was used and include location', function(done){
        var comments = extractor.extract('/**\n * Poster Comment\n **/ \n\n\n /**\n * Poster Comment\n **/');

        parser.on('warning', function(err){
          assert.equal(err + '', 'Error: You can\'t have more than one poster comment. Location: `file.scss:6:8`');
          done();
        });
        var result = parser.parse (comments, 'file.scss');
      });

      it('should emit an warning if not allowed comment type', function(done){
        parser.on('warning', function(err){
          assert.equal(err + '', 'Error: Annotation `allowedLimited` is not allowed on comment from type `testType3`.');
          done();
        });
        var result = parser.parse ([{
          lines : ['@allowedLimited'],
          context : { type : 'testType3'},
          commentRange : { start : 1, end :3 }
        }]);
      });

      it('should emit an warning if not allowed comment type and include location', function(done){
        parser.on('warning', function(err){
          assert.equal(err + '', 'Error: Annotation `allowedLimited` is not allowed on comment from type `testType3` in `file.js:1:3`.');
          done();
        });
        var result = parser.parse ([{
          lines : ['@allowedLimited'],
          context : { type : 'testType3'},
          commentRange : { start : 1, end :3 }
        }], 'file.js');
      });

      it('should work on allowed context.type', function(){
        var result = parser.parse ([{
          lines : ['@allowedLimited'],
          context : { type : 'workingType'},
          commentRange : { start : 1, end :3 }
        }]);
        assert.deepEqual(result[0].allowedLimited , []);
      });


      describe('# multiple true/false', function(){
        beforeEach(function(){
          var annotations = {
            _ : {
              alias : { }
            },
            test : {
              parse : function(line){
                return line;
              },
              multiple : false
            }
          };


          parser = new docParser.CommentParser(annotations);
        });

        it('should work for false', function(){

          var rawTestResult = parser.parse ([{
            lines : ['@test Hello'],
            context : { type : 'demo' },
            commentRange : { start : 1, end :3 }
          }]);

          assert.equal(rawTestResult[0].test, 'Hello');

        });

        it('should warn if used multiple times', function(done){

          parser.on('warning', function(err){
            assert.equal(err + '', 'Error: Annotation `test` is only allowed once per comment, second value will be ignored.');
            done();
          });

          var rawTestResult = parser.parse ([{
            lines : ['@test First', '@test Second'],
            context : { type : 'demo' },
            commentRange : { start : 1, end :3 }
          }]);

          assert.equal(rawTestResult[0].test, 'First');

        });

      });

      describe('# Default and extended values', function(){
        var annotations = {
          _ : {
            alias : {
              otherName : 'test'
            }
          },
          test : {
            parse : function(line){
              return line;
            },
            default : function(parsedComment){
              return ['default'];
            },
            autofill : function(parsedComment){
              parsedComment.test.push('extended');
            }
          }
        };

        it('should extend correctly', function(){

          parser = new docParser.CommentParser(annotations);

          var extendedResult = parser.parse ([{
            lines : ['@test hello'],
            context : { type : 'demo' },
            commentRange : { start : 1, end :3 }
          }]);

          assert.deepEqual(extendedResult[0].test, ['hello', 'extended']);


          var defaultResult = parser.parse ([{
            lines : ['Just a description'],
            context : { type : 'demo' },
            commentRange : { start : 1, end :3 }
          }]);

          assert.deepEqual(defaultResult[0].test, ['default', 'extended']);

        });

        it('should respect the config', function(){

          parser = new docParser.CommentParser(annotations, {
            autofill : true
          });

          var extendedResult = parser.parse ([{
            lines : ['@test hello'],
            context : { type : 'demo' },
            commentRange : { start : 1, end :3 }
          }]);

          assert.deepEqual(extendedResult[0].test, ['hello', 'extended']);


          parser = new docParser.CommentParser(annotations, {
            autofill : false
          });

          var defaultResult = parser.parse ([{
            lines : ['Just a description'],
            context : { type : 'demo' },
            commentRange : { start : 1, end :3 }
          }]);

          assert.deepEqual(defaultResult[0].test, ['default']);


          parser = new docParser.CommentParser(annotations, {
            autofill : ['test']
          });

          var defaultTestResult = parser.parse ([{
            lines : ['Just a description'],
            context : { type : 'demo' },
            commentRange : { start : 1, end :3 }
          }]);

          assert.deepEqual(defaultTestResult[0].test, ['default', 'extended']);

          parser = new docParser.CommentParser(annotations, {
            autofill : ['otherName']
          });

          var otherNameResult = parser.parse ([{
            lines : ['Just a description'],
            context : { type : 'demo' },
            commentRange : { start : 1, end :3 }
          }]);

          assert.deepEqual(otherNameResult[0].test, ['default', 'extended']);

        });

      });


      describe('# Pass in meta information about parsed object', function(){

        it('should include meta information', function(done){
          var annotations = {
            _ : {
              alias : { }
            },
            test : {
              parse : function(line, info, id){
                assert.equal(id, 'FileID');
                assert.deepEqual(info, {"description":"","commentRange":{"start":1,"end":3},"context":{"type":"demo"}});
                done();
              },
              multiple: false
            }
          };

          parser = new docParser.CommentParser(annotations);

          var extendedResult = parser.parse ([{
            lines : ['@test hello'],
            context : { type : 'demo' },
            commentRange : { start : 1, end :3 }
          }], 'FileID');

        });

      });

      describe('File with CRLF', function(){
        it('should extract comments', function (){
          var comments = getCommentsFrom('crlf.test.scss');
          assert.equal(comments.length, 2);
          assert.deepEqual(comments[0].lines, [
            'Block comment with CRLF.',
            'With multiple lines.'
          ]);
          assert.deepEqual(comments[0].commentRange, { start: 1, end: 4 });
          assert.deepEqual(comments[1].lines, [
            '',
            'Comment with CRLF.',
            'It have multiple lines in a single comment.',
            ''
          ]);
          assert.deepEqual(comments[1].commentRange, { start: 6, end: 9 });
        });
      });

    });
  });
});
