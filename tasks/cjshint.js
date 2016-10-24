"use strict";

module.exports = function cjshint(grunt) {
	// Load task
	grunt.loadNpmTasks("grunt-contrib-jshint");

	// Options
	return {
		files: ["docroot/js/core_gui/*.js",
				"docroot/js/partials/*.js",
				"docroot/js/*.js"],
		options: {
		    jshintrc: ".cjshintrc"
		}
	};
};
