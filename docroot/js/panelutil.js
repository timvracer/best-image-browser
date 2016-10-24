
//---------------------------------------------------------------------------------
//PanelUtil.js
//
// Javascript support for all crammly panels
//---------------------------------------------------------------------------------

var PU = null;

$(function() {
	PU = new PanelUtils();
});

// Utilities shared across UI panels
function PanelUtils () {

	this.CALLBACKS = [];

	//-----------------------------------------------------------
	// Init
	//
	// Calls the server to get configuration values
	//-----------------------------------------------------------

	var that = this;

	var i;

	$.ajax({

		url: "/sapi/import-config",
		dataType: "json",
		type: "GET",
		success: function(obj) {

			console.log(obj);
			//
			// call all the callbacks
			for (i=0; i<that.CALLBACKS.length; i++) {
				that.CALLBACKS[i](obj.resp);
			}
			that.CALLBACKS=[];
			return;
		},	
		error: function() {
			for (i=0; i<that.CALLBACKS.length; i++) {
				that.CALLBACKS[i](null);
			}
			that.CALLBACKS=[];
			console.log ("Implement /sapi/import-config for configuration information");
			return;	
		}	
	});

	// get paramaters that are AFTER the hash
	this.getParamater = function(theParameter) {
		var str = window.location.hash;

		var params = str.substr(str.indexOf("?")+1).split('&');
		//var params = window.location.hash.substr(1).split('&');

		for (var i = 0; i < params.length; i++) {
			var p=params[i].split('=');
			if (p[0] == theParameter) {
				return decodeURIComponent(p[1]);
			}
		}
		return false;
	}

	//-----------------------------------------------------------
	// Ready
	//
	// queues the provided function to callback after initialization
	// cb is used for flow control, but returns nothing useful
	//-----------------------------------------------------------
	this.ready = function(cb) {
		this.CALLBACKS.push(cb);
	};

	//---------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------
	this.getURLParam=function(name) {
		    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		    if (results) {
			    return results[1] || 0;
			} else {
				return "";
			}    
 	};

 	this.getBestImageData = function(hostUrl, query, callback) {

 		var cacheData = getCache(hostUrl+query);
 		// return cached data if it exists
 		if (cacheData) {
 			console.log("Found Cached Data");
 			callback (null, cacheData);
 			return;
 		}

    	// call the server to extract images (it will value check the string)
		$.ajax({

			url: "/api/get-best-image",
			data: {query: query, url: encodeURIComponent(hostUrl)},
			dataType: "json",
			type: "GET",
			success: function(obj) {
				setCache(hostUrl+query, obj);
				callback(null, obj);
				return;
			},	
			error: function(e) {
				console.log(e);
				callback (e, null);
				return;	
			}	
		});
	};

	var PU_CACHE = {};

	function getCache(key) {
		return PU_CACHE[key];
	}
	function setCache(key, data) {
		PU_CACHE[key] = data;
	}
}


