"use strict";

//---------------------------------------------------------------------------------
//Panel3.js
//
// Javascript support for the export panel
//---------------------------------------------------------------------------------

/* jshint unused: false */

$(function() {
	var EP = new Panel4();
});

var P4_CURRENT_CODE = "";
var P4_EDITOR;

/* jshint unused: true */

function Panel4 () {

	// Init the module, once PanelUtils is ready, set up click function 
	PU.ready(function() {
		console.log ("Comment Panel Init Panel 4");

		// Initialize the code editor
	    P4_EDITOR = ace.edit("p4-editor");
		P4_EDITOR.setShowPrintMargin(false);
	    P4_EDITOR.setTheme("ace/theme/twilight");
	    P4_EDITOR.getSession().setMode("ace/mode/json");
	    P4_EDITOR.$blockScrolling = Infinity;

	    // when a change is made, activate revert button and change text on return button
	    P4_EDITOR.getSession().on("change", function() {
			//setEscapeBtn("Revert and Go Back");
			$("#p4-revert").show();
		});
		P4_CURRENT_CODE = P4_EDITOR.getValue(P4_CURRENT_CODE); // keep track of what is in the editor

		// Button actions
		//
		$("#p4-cancel").click(function() {  // this is "Return"
			// restore original code from start of session
			P4_loadEditor(P4_CURRENT_CODE); // ignore any changes during this session/view
			$("#p4-revert").hide();
			window.history.back();
		});
		$("#p4-submit").click(function() {
			// restore original code from start of session
			P4_processValidate();
		});

		$("#p4-revert").click(function() {
			// restore original code from start of session
			P4_loadEditor(P4_CURRENT_CODE); // ignore any changes during this session/view
			P4_setEscapeBtn("Return");
			$("#p4-revert").hide();
		});
		$("#p4-reset").click(function() {
			// restore original code from startup, erase session edits completely
			P4_resetCodeToDefault();
		});
		$("#p4-download").click(function() {
			P4_downloadCode();
		});

		$("#p4-editor").show();
	});

	var p4that = this;
	registerPanelFn("panel4", "showFn", function(){p4that.P4panelShow();});

	//---------------------------------------------------------------------------------
	// panelShow
	//---------------------------------------------------------------------------------

	this.P4panelShow = function() {
		console.log("PANEL 4 SHOW");
		if (P4_EDITOR) {
			P4_CURRENT_CODE = P4_EDITOR.getValue(); // store current state
		}	
		P4_setEscapeBtn("Go Back");
	};

	//---------------------------------------------------------------------------------
	// setEscapeBtn
	//---------------------------------------------------------------------------------
	function P4_setEscapeBtn(text) {
		$("#p4-cancel").text(text);
	}
	//---------------------------------------------------------------------------------
	// processValidate
	//---------------------------------------------------------------------------------
	function P4_processValidate() {

		P4_validateCode(P4_EDITOR.getValue(P4_CURRENT_CODE), function(err, data) {
			if (err) {
				vgGUI.alertBox("ERROR: " + err);
			} else {
				vgGUI.messageModal("Code Passed Validation", ["SUBMIT", "Keep Editing", "Revert"], function(txt) {
					switch(txt) {
					case "SUBMIT":
						P4_CURRENT_CODE = data; // ignore any changes during this session/view
						P4_submitCodeToServer(P4_CURRENT_CODE);
						P4_setEscapeBtn("Return");
						$("#p4-revert").hide();
						break;
					case "Keep Editing":
						P4_CURRENT_CODE = data; // ignore any changes during this session/view
						P4_setEscapeBtn("Return");
						$("#p4-revert").hide();
						break;
					default:
						P4_loadEditor(P4_CURRENT_CODE); // ignore any changes during this session/view
						P4_setEscapeBtn("Return");
						$("#p4-revert").hide();
					}
				});
			}
		});
	}

	//---------------------------------------------------------------------------------
	// validateCode
	//---------------------------------------------------------------------------------
	function P4_validateCode(code, callback) {

		try {
			var obj = JSON.parse(code);
			console.log(obj);
			callback(null, code);
		} catch(e) {
			callback(e, null);
		}	
	}

	//---------------------------------------------------------------------------------
	// submitCodeToServer
	//---------------------------------------------------------------------------------
	function P4_submitCodeToServer(code) {

		$.ajax({

			url: "/api/set-scoring-config",
			dataType: "text",
			type: "POST",
			data: {code: code},

			success: function() {
				vgGUI.alertBox("Code Sent to Server Successfully");
				$("#p4-reset").removeClass("p4-hide");
				$("#p4-download").removeClass("p4-hide");
			},	
			error: function(e) {
				vgGUI.alertBox("POSTING algorithm failed: " + e.statusText);
			}
		});
	}

	//---------------------------------------------------------------------------------
	// downloadCode
	//---------------------------------------------------------------------------------
	function P4_downloadCode() {

		window.location = "/api/download-config";
	}
	//---------------------------------------------------------------------------------
	// resetCodeToDefault
	//---------------------------------------------------------------------------------
	function P4_resetCodeToDefault() {

		vgGUI.messageModal("This will eliminate all your edits and reset code to the system default.  Are you sure?", 
						["Yes", "No"], function(txt){

			if (txt==="No") {
				return;
			}
			$.ajax({

				url: "/api/reset-config",
				dataType: "json",
				type: "GET",

				success: function(obj) {
					vgGUI.alertBox("Code reset to default");
					$("#p4-reset").addClass("p4-hide");
					$("#p4-download").addClass("p4-hide");
					$("#p4-revert").hide();
	
					P4_CURRENT_CODE = obj.resp.data;
					P4_loadEditor(P4_CURRENT_CODE);
					P4_setEscapeBtn("Return");
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
	function P4_loadEditor(code) {
		var curPos = P4_EDITOR.getCursorPosition();
		P4_EDITOR.setValue(code);
		P4_EDITOR.gotoLine(curPos.row);
		P4_EDITOR.moveCursorTo(curPos.row, curPos.column);
	}
}

