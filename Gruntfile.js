module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-release');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    "babel": {
      options: {
        sourceMap: true,
        experimental: true,
        playground: true
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: 'src',
            src: ['**/*.js'],
            dest: 'lib'
          }
        ]
      }
    },

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
