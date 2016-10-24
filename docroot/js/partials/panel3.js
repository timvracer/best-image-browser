"use strict";

//---------------------------------------------------------------------------------
//Panel3.js
//
// Javascript support for the export panel
//---------------------------------------------------------------------------------

/* jshint unused: false */

$(function() {
	var EP = new Panel3();
});

var CURRENT_CODE = "";
var P3_EDITOR;

var P3_DEPS = {
	stringSimilarity: {
		compareTwoStrings: function(a,b) {return 0.0;}
	},
	url: {
		parse: function(x) {return x;}
	}
};

/* jshint unused: true */

function Panel3 () {

	// Init the module, once PanelUtils is ready, set up click function 
	PU.ready(function() {
		console.log ("Comment Panel Init Panel 3");

		// Initialize the code editor
	    P3_EDITOR = ace.edit("editor");
		P3_EDITOR.setShowPrintMargin(false);
	    P3_EDITOR.setTheme("ace/theme/twilight");
	    P3_EDITOR.getSession().setMode("ace/mode/javascript");
	    P3_EDITOR.$blockScrolling = Infinity;

	    // when a change is made, activate revert button and change text on return button
		P3_EDITOR.getSession().on("change", function() {
			//setEscapeBtn("Revert and Go Back");
			$("#p3-revert").show();
	    });
		CURRENT_CODE = P3_EDITOR.getValue(CURRENT_CODE); // keep track of what is in the editor

		// Button actions
		//
		$("#p3-cancel").click(function() {  // this is "Return"
			// restore original code from start of session
			loadEditor(CURRENT_CODE); // ignore any changes during this session/view
			$("#p3-revert").hide();
			window.history.back();
		});
		$("#p3-submit").click(function() {
			// restore original code from start of session
			processValidate();
		});

		$("#p3-revert").click(function() {
			// restore original code from start of session
			loadEditor(CURRENT_CODE); // ignore any changes during this session/view
			setEscapeBtn("Return");
			$("#p3-revert").hide();
		});
		$("#p3-reset").click(function() {
			// restore original code from startup, erase session edits completely
			resetCodeToDefault();
		});
		$("#p3-download").click(function() {
			downloadCode();
		});
	});

	var that = this;
	registerPanelFn("panel3", "showFn", function(){that.panelShow();});

	//---------------------------------------------------------------------------------
	// panelShow
	//---------------------------------------------------------------------------------

	this.panelShow = function() {
		console.log("PANEL 3 SHOW");
		if (P3_EDITOR) {
			CURRENT_CODE = P3_EDITOR.getValue(); // store current state
		}	
		setEscapeBtn("Go Back");
	};

	//---------------------------------------------------------------------------------
	// setEscapeBtn
	//---------------------------------------------------------------------------------
	function setEscapeBtn(text) {
		$("#p3-cancel").text(text);
	}
	//---------------------------------------------------------------------------------
	// processValidate
	//---------------------------------------------------------------------------------
	function processValidate() {

		validateCode(P3_EDITOR.getValue(CURRENT_CODE), function(err, data) {
			if (err) {
				vgGUI.alertBox("ERROR: " + err);
			} else {
				vgGUI.messageModal("Code Passed Validation", ["SUBMIT", "Keep Editing", "Revert"], function(txt) {
					switch(txt) {

					case "SUBMIT": 
						CURRENT_CODE = data; // ignore any changes during this session/view
						submitCodeToServer(CURRENT_CODE);
						setEscapeBtn("Return");
						$("#p3-revert").hide();
						break;
					case "Keep Editing": 
						CURRENT_CODE = data; // ignore any changes during this session/view
						setEscapeBtn("Return");
						$("#p3-revert").hide();
						break;
					default: 
						loadEditor(CURRENT_CODE); // ignore any changes during this session/view
						setEscapeBtn("Return");
						$("#p3-revert").hide();
					}
				});
			}
		});
	}

	//---------------------------------------------------------------------------------
	// validateCode
	//---------------------------------------------------------------------------------
	function validateCode(code, callback) {

		try {
/*jshint -W054 */
			var func = new Function("imgArray", "DEPS", "doSizeScore", code);
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
			func(objArray, P3_DEPS);
			console.log(objArray);
			if (objArray.length < 2) {
				callback("Returned OK, but array is not correct", null);
			} else {
				callback(null, code);
			}
		} catch(e) {
			callback(e, null);
		}	
	}

	//---------------------------------------------------------------------------------
	// submitCodeToServer
	//---------------------------------------------------------------------------------
	function submitCodeToServer(code) {

		$.ajax({

			url: "/api/set-scoring",
			dataType: "text",
			type: "POST",
			data: {code: code},

			success: function() {
				vgGUI.alertBox("Code Sent to Server Successfully");
				$("#p3-reset").removeClass("p3-hide");
				$("#p3-download").removeClass("p3-hide");
			},	
			error: function(e) {
				vgGUI.alertBox("POSTING algorithm failed: " + e.statusText);
			}
		});
	}

	//---------------------------------------------------------------------------------
	// downloadCode
	//---------------------------------------------------------------------------------
	function downloadCode() {

		window.location = "/api/download-code";
	}
	//---------------------------------------------------------------------------------
	// resetCodeToDefault
	//---------------------------------------------------------------------------------
	function resetCodeToDefault() {

		vgGUI.messageModal("This will eliminate all your edits and reset code to the system default.  Are you sure?", 
						["Yes", "No"], function(txt){

			if (txt==="No") {
				return;
			}
			$.ajax({

				url: "/api/reset-scoring",
				dataType: "json",
				type: "GET",

				success: function(obj) {
					vgGUI.alertBox("Code reset to default");
					$("#p3-reset").addClass("p3-hide");
					$("#p3-download").addClass("p3-hide");
	
					CURRENT_CODE = obj.resp.data;
					loadEditor(CURRENT_CODE);
					setEscapeBtn("Return");
				},	
				error: function(e) {
					vgGUI.alertBox("RESET failed: " + e.statusText);
				}
			});			
		});
	}
	//---------------------------------------------------------------------------------
	// loadEditor
	//
	// prevents funky highlighting by repositioning the cursor to where it was
	//---------------------------------------------------------------------------------
	function loadEditor(code) {
		var curPos = P3_EDITOR.getCursorPosition();
		P3_EDITOR.setValue(code);
		P3_EDITOR.gotoLine(curPos.row);
		P3_EDITOR.moveCursorTo(curPos.row, curPos.column);
	}
}

