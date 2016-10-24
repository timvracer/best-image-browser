"use strict";

//---------------------------------------------------------------------------------
//Panel2.js
//
// Javascript support for the export panel
//---------------------------------------------------------------------------------

/* jshint unused: false */

$(function() {
	var EP = new ExportPanel();
});

/* jshint unused: true */

function ExportPanel () {

	// Init the module, once PanelUtils is ready, set up click function 
	PU.ready(function() {
		console.log ("Comment Panel Init");

		$("#p2-score").click(function() {
			document.location = "#panel3";
		});
		$("#p2-score-config").click(function() {
			document.location = "#panel4";
		});
	});

	var that = this;
	registerPanelFn("panel2", "showFn", function(){that.panelShow();});

	//---------------------------------------------------------------------------------
	// panelShow
	//---------------------------------------------------------------------------------

	this.panelShow = function() {

		var hostUrl = PU.getParamater("urlHost");
		var query = PU.getParamater("q");

		// update the url and query fields
		$(".urlhdr").html("<b>URL:</b> " + hostUrl);
		$(".urlhdr-link").attr("href", hostUrl);
		$(".queryhdr").html("<b>QUERY:</b> " + query);
		
		console.log ("export show");

		loadReportBody(hostUrl, query);
	};

	//---------------------------------------------------------------------------------
	// loadReportBody
	//---------------------------------------------------------------------------------
	function loadReportBody(hostUrl, query) {

		vgGUI.showSpinner();
		PU.getBestImageData(hostUrl, query, function(err, data) {

			vgGUI.hideSpinner();
			if (err) {
				vgGUI.alertBox("Error retrieving data for: " + hostUrl);
				return;
			}
			console.log("Got the data for " + hostUrl + ":" + query);
			console.log(data);
			$(".doctitle").html("<b>DOC TITLE:</b> " + data.resp.debugInfo.scoredImageArray[0].docTitle);
			fillReport(data);
			return;
		});
	}

	//---------------------------------------------------------------------------------
	// fillReport
	//---------------------------------------------------------------------------------
	function fillReport(data) {

		var e;
		var template = new EJS({url: "/templates/report.ejs"});

		var imgArray = data.resp.debugInfo.SizeScoredImageArray;
		var imgArray2 = data.resp.debugInfo.scoredImageArray;

	    $("#submissions-report").remove();
		e = template.render({imgArray: imgArray, imgArray2: imgArray2});
		$(".p2-report-body").append(e);
/*		
		$(".row-btn").click(function() {
			processRowClick (this);
		});
*/		
	}

}

