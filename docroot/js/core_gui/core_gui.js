
"use strict";

//
// V_GUI 
//
// simple to use GUI tools (message boxes, spinners, etc.)
//
// Requires EJS (ejs_production.ejs), and jQuery
// provided templates should be in the /templates directory off docroot
//
/* globals vgGUI: true */

var vgGUI = null;

$(function() {
	vgGUI = new vgs();
	console.log ("VGGUI init");
});

var vgs = function() {

	// some DOM objects that get inserted when needed
	var MASK = "<div id='vgMask' class='vg-mask'></div>";
	var SPIN = "<div id='vgSpin' class='ball-loader'> <p> Loading... </p></div>";
	var MODAL = "<div class='vg-modal'><div class='vg-modal-head'><div class='vg-close vg-tabable'>&#215</div><div class='vg-title'></div></div><div class='vg-modal-body'></div><div class='vg-btn-bar'></div></div>";
	var BTN = "<div class='vg-btn vg-tabable'></div>";

	var that = this;
	this.maskCount = 0;
    this.shifted = false;
    
    // keep track of key states
    //
    $(document).keydown(function(e) {
        if (e.which===16) {
            that.shifted = true;
        }    
    });
    $(document).keyup(function(e) {
        if (e.which===16) {
            that.shifted = false;
        }    
    });

	//----------------------------------------------------------------
	// showMask
	//
	// shows the mask that covers the entire html window
	// using height 100% doesn't work right, so use JS to calc height
	this.showMask = function() {
		if (this.maskCount <= 0) {			
			$("body").prepend(MASK);
			sizeMask();
			$(window).resize(function() {
				sizeMask();
			});
		}	
		this.maskCount++;
	};
	//----------------------------------------------------------------
	// hideMask
	//
	// hide the mask
	this.hideMask = function() {
		this.maskCount--;
		if (this.maskCount < 1) {
			$(".vg-mask").remove();
			this.maskCount = 0;
		}	
	};
	//----------------------------------------------------------------
	// showSpinner
	//
	// show the css spinner (bouncing ball)
	this.showSpinner = function () {
		that.showMask();
		$("#vgMask").append(SPIN);
	};
	//----------------------------------------------------------------
	// hideSpinner
	//
	// hide the spinner
	this.hideSpinner = function () {
		that.hideMask();
		$(".ball-loader").remove();
	};

	//----------------------------------------------------------------
	// showModal
	//
	// Show a standard modal box specified by the template.  Sends the data object "data" to the 
	// template.  Options is an object with the title, and an array of strings for the buttons
	// the button string is returned in the callback if a button is pressed
	// dismiss the modal using hideModal()
	//
	// options = {data: {<data for template>}, title: "Title String", buttons: ['btn1', 'btn2', 'btn3']}

	var MODAL_ID = 1;

	this.showModal = function(templateName, options, cb) {

		var html, modalTag, modalElement, modalId;
		var template = new EJS({url: "/templates/" + templateName + ".ejs"});
		var data = null;
		var buttons = ["Ok"];

		if (exists(options)) {
			if ("data" in options) {
				data = options.data;
			}
			if ("buttons" in options) {
				buttons = options.buttons;
			}
		}
			
		if (template) {
			that.showMask();

			modalTag = MODAL;
			modalId = "vg-modal-" + MODAL_ID++;
			modalElement = $(modalTag).attr("id", modalId);

			$("#vgMask").append(modalElement);
			modalElement = $("#"+modalId);

			html = template.render(data);
			modalElement.find(".vg-modal-body").append(html);
			modalElement.find(".vg-title").text(options.title);

			// add buttons
			setupButtons (modalElement.find(".vg-btn-bar"), buttons, cb);
			// setup actions
			setBtnClick (modalElement.find(".vg-close"), that.hideModal);
			modalElement.find(".vg-close").attr("tabindex", 0);

			centerWindow(modalElement);

			$(window).resize(function() {
				centerWindow(modalElement);
				sizeMask();
			});
		}	
	};

	//----------------------------------------------------------------
	// textModal
	//
	// callback is called BEFORE the modal is dismissed.  if you return
	// "keep" from the callback, the modal will not be dismissed
	this.textModal = function(message, btns, cb) {
		var opts = {title: "Enter Text",
				data: {msg: message},
				buttons:["Ok"]
		};
		if (exists(btns)) {
			opts.buttons = btns;
		}
		that.showModal("core_gui/textmodal", opts, function(txt, el) {
			var retText = $(el.parent()).find(".text-modal-field").val();
			console.log(retText);
			that.hideModal();
			if (exists(cb)) {
				cb(txt, retText);
			}
		});
	};
	//----------------------------------------------------------------
	// messageModal
	//
	this.messageModal = function(message, btns, cb) {
		var opts = {title: "Feedback! Message",
					data: {msg: message},
					buttons:["Ok"]
		};
		if (exists(btns)) {
			opts.buttons = btns;
		}
		that.showModal("core_gui/messagebox", opts, function(txt){
			that.hideModal();
			if (exists(cb)) {
				cb(txt);
			}
		});
	};

	this.alertBox = function(message, cb) {
		that.messageModal(message, null, cb);
	};

	//----------------------------------------------------------------
	// hideModal
	//
	// hides the TOPMOST modal window
	//
	this.hideModal = function() {
		that.hideMask();
		var allWindows = $(".vg-modal");
		if (allWindows.length > 0) {
			allWindows[allWindows.length-1].remove();
		}	
	};

	//----------------------------------------------------------------
	// centerWindow
	function centerWindow(el) {

		var w = $(el).width();
		var h = $(el).height();
		var sw = $(window).width();
		var sh = $(window).height();
		$(el).css("left", (sw-w)/2 + "px");
		$(el).css("top", (sh-h)/2 + "px");
	}

	//----------------------------------------------------------------
	// sizeMask
	function sizeMask() {

		var el = $(".vg-mask");
		var sw = $(document).width();
		var sh = $(document).height();
		$(el).css("width", sw + "px");
		$(el).css("height", sh + "px");
	}

	//----------------------------------------------------------------
	// setBtnClick
	function setBtnClick(el, cb) {
		$(el).click(function() {
			cb($(el).text(), el);
		});
	}

/*
    function stop_tab(e){
        if(e.target.id === "vg-btn-ok"){
            if(e.keyCode === 10){
                e.preventDefault();
            }
        }
    }
*/
	//----------------------------------------------------------------
	// setupButtons
	//
	// Setup the buttons based on the strings
	function setupButtons(el, btns, cb) {
		var e, i;

		for (i=0; i<btns.length; i++) {
			e = $(BTN).attr("tabindex", i+1);
			e = $(e).text(btns[i]);
			$(e).click(function(e) {
				var txt = $(e.target).text();
				cb(txt, el);
			});
			$(el).append(e);
		}
		$(el).find(".vg-btn").first().focus();

		setupButtonKeyActions ("vg-tabable");
	}

	//----------------------------------------------------------------
	// setupButtonKeyActions
	//
	// Sets up custom tabbing within the modal dialog and captures 
	// enter key.  Pass in the classname that is used to identify 
	// any controls you want in the tab order
	//
	function setupButtonKeyActions(classname) {

	    $("." + classname).keydown(function(e) {
	        if (e.which === 9) {
				e.preventDefault();
				var numTabable = $(".vg-tabable").length;
				var nextTab = parseInt($(e.target).attr("tabindex"), 10) + (that.shifted ? -1 : 1);
				if (nextTab < 0) {
					nextTab = numTabable-1;
				}
				if (nextTab >= numTabable) {
					nextTab = 0;
				}
				nextTab = Math.min(nextTab, numTabable);
				nextTab = Math.max(nextTab, 0);
				$("."+classname)[nextTab].focus();
			}
			if (e.which === 13) {
				$(e.target).trigger("click");
			}
		});
	}
};


