module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        concat: {
            js: {
                src: [
                    'src/scripts/staffimUtils.module.js',
                    'src/scripts/staffimUtils.constant.js',
                    'src/scripts/staffimUtils.listener.js',
                    'src/scripts/staffimUtils.menu.js',
                    'src/scripts/staffimUtils.interceptor.js',
                    'src/scripts/staffimUtils.page.js',
                    'src/scripts/staffimUtils.route.js',
                    'src/scripts/staffimUtils.state.js',
                    'src/scripts/staffimUtils.underscore.js',
                    'src/scripts/staffimUtils.waves.js',
                    'src/scripts/staffimUtils.uploader.js',
                    'src/scripts/staffimUtils.logger.js'
                ],
                dest: './dist/staffim-utils.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('dist', ['concat']);
};
