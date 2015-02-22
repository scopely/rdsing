module.exports = function(grunt) {

  require("load-grunt-tasks")(grunt);

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

    jsdoc : {
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
    }
  });

  grunt.registerTask("default", ["babel"]);
};
