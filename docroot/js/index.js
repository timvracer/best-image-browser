// CRAMMLY.JS
//
// The main JS program here is simply a manager of "panels".  Each panel as part of it's ready function may
// register itself by calling registerPanelFn.  If it does, it will receive notifications when it's panel is
// activated/shown.  
//
// A panel is essentially a DIV whose ID is indicated in VALID_PANELS.  The div's are created on the server side
// via a EJS partial in the views/partials directory.  All the CSS, JS, and HTML for all the panels is included in
// the index.html page on load.  A more 'elegant' solution might request these "panels" and DOM insert them, but
// that will be left as an exercise to the curious
//

var VERBOSE = true;
var SOCKET;

var VALID_PANELS = {
	panel1: {},
	panel2: {},
	panel3: {},
	panel4: {}
};

// helper function
function exists(a) {return (a!=undefined && a!=null)}
logger("startup");


//---------------------------------------------------------------------------------
// logging function, use your own logger if desired
//
function logger(msg) {
	if (VERBOSE) {
		console.log (msg);
	}
}

//---------------------------------------------------------------------------------
// startup
//
// called on document ready
//
function startup() {

 	hashChange(null);
	window.onhashchange = hashChange;
	document.body.addEventListener('animationend', removeElement);
	document.body.addEventListener('webkitAnimationEnd', removeElement);
	//document.location = "#panel1";
}


//}

//---------------------------------------------------------------------------------
// register a panel function
//
// values for fnName:
// showFn = used to notify when panel is shown
//
function registerPanelFn (panel, fnName, fn) {
	if (panel in VALID_PANELS && exists(fn)) {
		VALID_PANELS[panel][fnName] = fn;
		console.log(VALID_PANELS);
	}
}

//---------------------------------------------------------------------------------
// hashChange
//
//
function hashChange(event) {

    var hash = window.location.hash.replace("#", "").split('?')[0];  // strip off paramaters from the hash for nav

    if (hash == "") {
    	has="panel1";
    }
    if (hash == "" || hash == "menupanel"){
        $("#menupanel-link").css("visibility","hidden");
    } else {
        $("#menupanel-link").css("visibility","visible");
    }

	logger ("hash change to " + hash);
	logger(event);
	if (hash in VALID_PANELS) {
		if (!exists(event)) {
			$(".mpanel").addClass('mphide');
			$("#"+hash).removeClass('mphide');
		} else {	
			$(".mpanel").addClass('removed');
			$("#"+hash).addClass('mpshow');
		}	
		//
		if ("showFn" in VALID_PANELS[hash]) {
			VALID_PANELS[hash].showFn();
		}
	}
	return true;
}

function removeElement(event) {

	if (event.animationName == 'disapear') {
		$(".removed").removeClass("removed").addClass("mphide");
		$(".mpshow").addClass("added").removeClass("mpshow").removeClass("mphide");
	}	
}



