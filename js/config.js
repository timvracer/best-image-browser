//
// CONFIG
// CONFIG.JS
//
// Reads the YAML file based on environment, and stored in memory for access by app
// Restart required if YAML data changes
//


// NOTE - This module is intented to operate as a SINGLETON (one instance).  Node will consider this a singleton if all references
// to the module are identical.  Node is smart enough to resolve path name differences (so you may reference this from different
//	subfolders in the project), but it IS case-sensitive.  Thus, "require("./vconfig") " is different from "require ("./Vconfig")". 
// However, "require("./vconfig")" and "require("./js/vocnfig")" will refer to the same instance presuming if the paths resolve
// to the same module file.
//
console.log ("INITIALIZING CONFIG");

var env = process.env.NODE_ENV || "development";

var yaml = require("js-yaml");
var fs = require("fs");
var config = yaml.load(fs.readFileSync("./app-config.yaml"));

if (env === "production") {
	module.exports = config.production;
} else {
	module.exports = config.development;
}

