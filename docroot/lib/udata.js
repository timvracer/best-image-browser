//
//
// USER DATA
//
// Manage user tracking and personalization
//
//
// Cookie Values we store (some will be deprecated when we get back end user accounts)
//


// CALLBACK Routine to set the user cookie to the uID 
//

function _UD () {

	this.showCookies = function() {	
		alert (document.cookie);
	}

	this.deleteCookie = function(c_name) {
	    document.cookie = c_name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
	}

	this.setCookie = function(c_name,value,exdays) {

		if (exdays == undefined) {
			exdays = 999;
		}
		var exdate=new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
		document.cookie=c_name + "=" + c_value;
	}

	this.getCookie = function(c_name) {

		var i,x,y,ARRcookies=document.cookie.split(";");
		for (i=0;i<ARRcookies.length;i++)
		{
			x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
			y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
			x=x.replace(/^\s+|\s+$/g,"");
			if (x==c_name)
			{
				return unescape(y);
			}
		  }
		 return ""; 
	}
}