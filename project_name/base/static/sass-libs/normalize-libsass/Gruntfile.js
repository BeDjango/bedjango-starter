module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      options: {
      },
      dist: {
        files: {
          'tests/controls/font.css': 'tests/tests/font.scss',
          'tests/controls/ie8.css': 'tests/tests/ie8.scss',
          'tests/controls/ie9.css': 'tests/tests/ie9.scss',
          'tests/controls/ie10.css': 'tests/tests/ie10.scss',
          'tests/controls/ie11.css': 'tests/tests/ie11.scss',
          'tests/controls/safari6.css': 'tests/tests/safari6.scss',
          'tests/controls/safari7.css': 'tests/tests/safari7.scss',
          'tests/controls/strict.css': 'tests/tests/strict.scss'
        }
      }
    },
    clean: {
      css: ['tests/controls/*.css']
    },
    scsslint: {
      allFiles: [
        'tests/tests/*.scss',
        '*.scss'
      ],
      options: {
        bundleExec: true,
        config: '.scss-lint.yml',
        reporterOutput: 'scss-lint-report.xml',
        colorizeOutput: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-scss-lint');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['clean:css', 'sass']);
  grunt.registerTask('test', ['default', 'scsslint']);
};
