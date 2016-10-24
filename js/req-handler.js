
"use strict";

var config = require("./config.js");

var serveStatic = require("serve-static");
var finalhandler = require("finalhandler");
var util = require("util");
var cycle = require("cycle");
var path = require("path");
var io = require("socket.io");
var _ = require("underscore");
var fs = require("fs");
var dateformat = require("dateformat");
var csv = require("express-csv");

var stringSimilarity = require("string-similarity");

var bestImage = require("best-image");
bestImage.init(console.log, console.log, console.log, console.log);


//---------------------------------------------------------------------------------
// logging function that will provide user info if this is request based
// and the req.session data is set
//---------------------------------------------------------------------------------
var VERBOSE = true;
var argv = require("minimist")(process.argv.slice(2));
if (exists(argv.v)) {VERBOSE = true;}
//----------------------------------------------------------------------------------------
// LOGGER function
//----------------------------------------------------------------------------------------
function logger(msg, req) {
	var fullMsg = "";

	if (VERBOSE) {
		fullMsg = dateformat(Date.now(), "isoDateTime") + " | " + fullMsg + " => " + msg;
		console.log (fullMsg);
	}	
}


//-------------------------------------------------------------------------------------------
// set up the root directory from which to SERVE from, map various forms of index
var SERVE = serveStatic( process.cwd() + config.docroot, {"index": ["index.html", "index.htm"]});

var SOCKET_PORT = null;
var TIMER_HANDLE = null;

logger("INIT REQHANDLER");
logger(process.cwd() + config.docroot);

// helper function because I miss coffeescript
function exists(a) {return (a!==undefined && a!==null);}

//---------------------------------------------------------------------------------
// Clear, explicit routing table - easy to understand and modify in context.
// processed with a single FIND statement (underscore).  Add your new api processing
// functions below and add to the table to support new routes.  
//---------------------------------------------------------------------------------
var NPMLPB_ENDPOINTS = [
	{"key" : "/api/socket-port", "func" : api_socketPort},
	{"key" : "/api/get-best-image", "func" : api_getBestImage},
	{"key" : "/api/set-scoring", "func" : api_setScoring},
	{"key" : "/api/download-code", "func" : api_downloadCode},
	{"key" : "/api/download-config", "func" : api_downloadConfig},
	{"key" : "/api/set-scoring-config", "func" : api_setScoringConfig},
	{"key" : "/api/reset-config", "func" : api_resetConfig},
	{"key" : "/api/reset-scoring", "func" : api_resetScoring}
];

//---------------------------------------------------------------------------------
// ProcessRequest
//
// exported function for processing a request.  
//---------------------------------------------------------------------------------
function processRequest(req, res) {
	var apiObj;

	logger("REQUEST URL: " + req.url, req);

	// look in the routing table for an api match
	apiObj = _.find(NPMLPB_ENDPOINTS, function(rec){return ((rec.key) === req.path);});

	if (exists(apiObj)) {
		// call the configured API
		return apiObj.func(req, res);
	} else {
		// attempt to serve the request as a static asset
		var done = finalhandler(req, res);
		SERVE(req,res, done);
		return;
	}
}	

//====================================
// API FUNCTIONS
//====================================
//---------------------------------------------------------------------------------
// api_socketPort
//
// return the port number of the configured socket.io connection
//---------------------------------------------------------------------------------
function api_socketPort(req, res) {
	var retObj = {};
	retObj.port = config.socketPort;
	writeAPIResponse(null, retObj, res, false);
}

//---------------------------------------------------------------------------------
// api_downloadCode
//
//---------------------------------------------------------------------------------
function api_downloadCode(req,res) {
	res.writeHead(200, {"Content-Type": "application/force-download","Content-disposition":"attachment; filename=scoreFn.js"});

	if (!req.session.scoringFunction) {
		fs.readFile("views/partials/score-function.ejs", "utf8", function(err, data) {
			res.end(removePlaceholders(data));
		});
	} else {
		res.end(removePlaceholders(req.session.scoringFunction));
	}
}

//---------------------------------------------------------------------------------
// api_downloadConfig
//
//---------------------------------------------------------------------------------
function api_downloadConfig(req,res) {
	res.writeHead(200, {"Content-Type": "application/force-download","Content-disposition":"attachment; filename=scoreConfig.json"});

	if (!req.session.scoringConfig) {
		fs.readFile("views/partials/score-config.ejs", "utf8", function(err, data) {
			res.end(data);
		});
	} else {
		res.end(req.session.scoringConfig);
	}
}

//---------------------------------------------------------------------------------
// api_resetScoring
//
//---------------------------------------------------------------------------------
function api_resetScoring(req,res) {
	delete req.session.scoringFunction;

	fs.readFile("views/partials/score-function.ejs", "utf8", function(err, data) {
		writeAPIResponse(err, {data: data}, res, false);
	});
}

//---------------------------------------------------------------------------------
// api_resetConfig
//
//---------------------------------------------------------------------------------
function api_resetConfig(req,res) {

	delete req.session.scoringConfig;
	bestImage.setConfig({});

	fs.readFile("views/partials/score-config.ejs", "utf8", function(err, data) {
		writeAPIResponse(err, {data: data}, res, false);
	});
}
//---------------------------------------------------------------------------------
// api_setScoring
//
//---------------------------------------------------------------------------------
function api_setScoring(req,res) {
	var funcText;

	var P3_DEPS = {
		stringSimilarity: {
			compareTwoStrings: function(a,b) {return 0.0;}
		},
		url: {
			parse: function(x) {return x;}
		}
	};
	console.log("set scoring");
	console.log(req.body.code);

/*jshint -W054 */
	try {
		var testFunction = new Function("imgArray", "DEPS", "doSizeScore", req.body.code);
/*jshint +W054 */

		var objArray = [
			{
				src: "http://image.source.com/index.jpg",
				title: "hello",
				class: "eyecare",
				isMeta: true,
				docTitle: "How to care for eyes",
				score: 0
			},
			{
				src: "http://image.source.com/pixel.gif",
				title: "hello",
				class: "eyecare",
				isMeta: false,
				docTitle: "How to care for eyes",
				score: 0
			}				
		];

		testFunction(objArray, P3_DEPS, false);
		if (objArray.length < 2) {
			writeAPIResponse("Error Parsing Function", null, res, false);
			return;
		}

		req.session.scoringFunction = req.body.code;
		console.log(req.session);

		writeAPIResponse(null, null, res, false);
			
	} catch(e) {
		console.log("ERROR PARSING FUNCTION");
		console.log(e);
		writeAPIResponse("Error Parsing Function", null, res, false);
	}	
}

function removePlaceholders(text) {
	var i1 = text.indexOf("//PLACEHOLDER");
	var i2 = text.indexOf("//ENDPLACEHOLDER");

	return text.slice(0, i1) + text.slice(i2);
}

//---------------------------------------------------------------------------------
// api_setScoringConfig
//
//---------------------------------------------------------------------------------
function api_setScoringConfig(req,res) {

	console.log("set scoring config");

	try {
		var scoreConfig = JSON.parse(req.body.code);
		req.session.scoringConfig = req.body.code;
		console.log(scoreConfig);
		writeAPIResponse(null, null, res, false);
			
	} catch(e) {
		console.log("ERROR PARSING CONFIG");
		console.log(e);
		writeAPIResponse("Error Parsing Config", null, res, false);
	}	
}

//---------------------------------------------------------------------------------
// api_getBestImage
//
//---------------------------------------------------------------------------------
function api_getBestImage(req, res) {

	var ret = "incorrect paramaters";
	var hostUrl;
	var query = null;
	var scoreFn = null;

	if (req.query.url) {
		hostUrl = decodeURIComponent(req.query.url);
		if (req.query.query) {
			query = req.query.query;
		}

/*jshint -W054 */
		if (req.session.scoringFunction) {
			var newCode = removePlaceholders(req.session.scoringFunction);
			scoreFn = new Function("imgArray", "DEPS", "doSizeScore", newCode);
			console.log("Using Alternative Scoring Function");
		}
/*jshint +W054 */
		if (req.session.scoringConfig) {
			bestImage.setConfig(JSON.parse(req.session.scoringConfig));
		}

		bestImage.getBestImageDebug(hostUrl, query, function(err, data) {

			console.log("RETURNED FROM BEST IMAGE");
			console.log(err); 
			console.log(data);

			if (err) {
				writeAPIResponse(err, null, res, false);
			} else {
				writeAPIResponse(null, data, res, false);
			}
		}, scoreFn);

	} else {
		writeAPIResponse(null, ret, res, false);
	}	
}


//---------------------------------------------------------------------------------
// writeAPIResponse
//
// helper function for API responses which all do the same things when 
// writing out their response
//
// set bcycle to true if you may have cyclical (recursive) JSON, that is, when
// you may have a duplicate object name nested in an object { a: {a: xx, b: xx} } 
// 
//---------------------------------------------------------------------------------
function writeAPIResponse(err, jsObj, res, bcycle) {
	var retObj = {};

	retObj.type = "JSON";
	if (err) {
		retObj.status = "error";
		retObj.error = err;
		retObj.resp = jsObj;  // send the response as asked, but with the error coding
	} else {
		retObj.status = "success";
		if (bcycle) {
			jsObj = cycle.decycle(jsObj);
		}	
		retObj.resp = jsObj;
	}

	logger("SENDING API RESULTS ");
	//logger(JSON.stringify(retObj));

	res.writeHead(200, {"Content-Type": "application/json"});
	res.write(JSON.stringify(retObj));

	res.end();
}

//---------------------------------------------------------------------------------
// tryParseJson
//
// will return NULL if JSON is malformed (prevent thread from crashing)
// 
//---------------------------------------------------------------------------------

function tryParseJson(str) {
    try {
        return JSON.parse(str);
    } catch (ex) {
        return null;
    }
}

//=============================================================================================================
// EXPORTS
//=============================================================================================================
module.exports.processRequest = processRequest;
module.exports.logger  = logger;

//=============================================================================================================
// SUPPORT FUNCTIONS
//=============================================================================================================





