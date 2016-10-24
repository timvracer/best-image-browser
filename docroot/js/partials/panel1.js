"use strict";

//---------------------------------------------------------------------------------
//Panel1.js
//
// Javascript support for the import panel
//---------------------------------------------------------------------------------

// Panel functions are all namespaced within the IP object
//

/* jshint unused: false */

$(function() {
	var IP = new ImportPanel();
});

/* jshint unused: true */

// The namespace object
function ImportPanel () {

	//---------------------------------------------------------------------------------
	// CONSTRUCTOR
	//---------------------------------------------------------------------------------

	// Initialize the namespace object when the PanelUtil object is ready
	PU.ready(function() {
	});	

	console.log ("Panel 1 Init");
	$(".p1-action-btn").click(function() {
		$("#image-info-container").slideUp();
		console.log("clicked");
		getBestImage($(".querybox").val(), $(".urlbox").val());
	});
	$(".p1-get-details").click(function(e) {
		var query = $(e.target).attr("query");
		var hostUrl = $(e.target).attr("hosturl");

		document.location = "#panel2?q=" + encodeURIComponent(query) + "&urlHost=" + encodeURIComponent(hostUrl);
		//viewReport();
		//document.location = "#panel2";
	});
	$(".urlbox").click(function() {
		this.select();
	});

    this.panelShow = function() {
        // Display logic to set report type to import when navigating from export page

    };

    function getBestImage(query, urlstring) {
		console.log("URL is " + urlstring);

		vgGUI.showSpinner();
		PU.getBestImageData(urlstring, query, function(err, data) {

			vgGUI.hideSpinner();
			if (err) {
				vgGUI.alertBox(err);
				return;	
			} else {
				console.log("DataReturned:");
				console.log(data);
				var firstUrl = data.resp.bestImageUrl;

				$("#image-box").attr("src", firstUrl);
				$("#fld-url").text(firstUrl);
				$("#fld-url-link").attr("href", firstUrl);

				var statsStr = "isMeta: ";
				if (data.resp.debugInfo.scoredImageArray[0].isMeta) {
					statsStr += "true";
				} else {
					statsStr += "false";
				}
				statsStr += " | Score: " + data.resp.debugInfo.scoredImageArray[0].score;

				$("#img-stats").text(statsStr);
				console.log("stats:" + statsStr);

				$("#image-info-container").slideDown();

				// set query and url as attributes of the details button
				$(".p1-get-details").attr("hosturl", urlstring);
				$(".p1-get-details").attr("query", query);

				return;
			}
		});
    }

}



