"use strict";

module.exports = function jshint(grunt) {
	// Load task
	grunt.loadNpmTasks("grunt-contrib-jshint");

	// Options
	return {
		node: {
			src: ["index.js", "js/**/*.js", 
					"test/**/*.js"],
			options: {
			    jshintrc: ".jshintrc"
			},
		},	
		client: {
			src: [	"docroot/js/core_gui/*.js",
					"docroot/js/partials/*.js"],
			options: {
			    jshintrc: ".cjshintrc"
			}
		}
	};
};
