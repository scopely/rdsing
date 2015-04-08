module.exports = function(grunt) {

  require("load-grunt-tasks")(grunt);

  grunt.initConfig({
    'gh-pages': {
      options: {
        base: 'doc'
      },
      all: {
        src: ['**']
      }
    },

    jsdoc: {
      options: {
          destination: 'doc'
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: 'src',
            src: '**/*.js'
          }
        ]
      }
    },

    release: {
      options: {
        beforeReleaseTasks: ['babel'],
        afterReleaseTasks: ['jsdoc', 'gh-pages']
      }
    }
  });

  grunt.registerTask("default", ["babel"]);
};
