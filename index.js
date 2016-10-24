
"use strict";

var config = require("./js/config.js");

var http = require("http");
var https = require("https");
var fs = require("fs");
var socketio = require("socket.io");
var express = require("express");
var expressSanitizer = require("express-sanitizer");
var app = express();
var session = require("express-session");

var reqHandler = require("./js/req-handler.js");

var bodyParser = require("body-parser");
var pjson = require("./package.json");

//---------------------------------------------------------------------------------
// helper function because I miss coffeescript
function exists(a) {return (a!==undefined && a!==null);}

var expiresAt = Date.now() + 10 * 60000;

// using the "session" middleware to support sessions, currently not persisted (sessions in memory - wont work multi server)
//app.use(session({secret: "1234567890QWERTY", resave: false, saveUninitialized: true, expiresAt: expiresAt, currPage: "/"}));
app.use(session({secret:"keyboard.cat", resave:false, saveUninitialized: true}));

// bodyParser middleware for parsing req paramaters and making them easily avaialble
app.use(bodyParser.urlencoded({ extended: false }));

// express-sanitizer is used when desired to sanitize user input
app.use(expressSanitizer());

// We are using the EJS templating engine  (find templates in "views" directory off root)
app.set("view engine", "ejs");

// Indicates what port to use for socket communication
// reqHandler.setSocketPort(config.socketPort);  // future use for socket.io

//--------------------------------------------------------
// index.html - main page (must be logged in)
//--------------------------------------------------------
app.get("/", function(req,res) {
	res.redirect("/index#panel1");	
	//renderPage(req, res, "index");
});

app.get("/index*", function(req,res) {
	renderPage(req, res, "index");
});
//---------------------------------------
// API calls that require authentication
//---------------------------------------
app.get("/sapi/*", function(req,res) {
	makeApiCall(req, res);
});
app.post("/sapi/*", function(req,res) {
	makeApiCall(req, res);
});


//--------------------------------------------------------
// UNAUTHENTICATED PAGES
//--------------------------------------------------------

//--------------------------------------------------------
// /login
//--------------------------------------------------------
app.get("/login", function(req,res) {
	renderPage(req, res, "login");
});
//--------------------------------------------------------
// /about
//--------------------------------------------------------
app.get("/about", function(req,res) {
	renderPage(req, res, "about");
});


//--------------------------------------------------------
// Process all other requests (web server)
//--------------------------------------------------------
app.get ("/*", function(req,res) {
	return reqHandler.processRequest(req,res);
});
app.post ("/*", function(req,res) {
	return reqHandler.processRequest(req,res);
});

//--------------------------------------------------------
// LISTENER for the server
//--------------------------------------------------------
var httpServer = http.createServer(app).listen(config.serverPort, config.serverHost);
if (config.sslServerPort) {
    var sslOptions = {
		key: fs.readFileSync("key.pem"),
		cert: fs.readFileSync("cert.pem")
    };
    var httpsServer = https.createServer(sslOptions, app).listen(config.sslServerPort, config.serverHost);
}

var ioServer = new socketio(httpServer);
// set the ioServer as an app property to make it widely accessible
app.set("io", ioServer);

reqHandler.logger("Server running at http://" + (config.serverHost || "*") +
		":" +  config.serverPort + "/ : reqHandler socket on port <host>:" + config.socketPort);
reqHandler.logger("Server running at https://" + (config.serverHost || "*") +
		":" +  config.serverPort + "/ : reqHandler socket on port <host>:" + config.socketPort);

//============================================================================================
// SUPPORT FUNCTIONS
//============================================================================================

//--------------------------------------------------------
// makeApiCall
//
// page defines an ejs view, will render via ejs if it is present
//
//--------------------------------------------------------
function makeApiCall(req, res) {
	return reqHandler.processRequest(req,res);
}

//--------------------------------------------------------
// renderPage
//
// Helper function to render a view/page, and centralize
// some housekeeping
//--------------------------------------------------------
function renderPage(req, res, page) {

	// This information is the object sent to all the templates which
	// are rendered.  Used for globally shared information, like login info
	//
	console.log(req.session);
	var renderInfo = {
		session: req.session,
		username: "",
		userrole: "",
		loggedIn: false,
		config: config,
		version: pjson.version
	};

	console.log ("page = " + page);
	res.render("pages/" + page, renderInfo);
}


