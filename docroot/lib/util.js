
// UTILITY FUNCTIONS
// accessed via vgUTIL
//
$(function() {

	var util = function() {

		var that = this;
	    this.shifted = false;
	    
	    // keep track of key states
	    //
	    $(document).keydown(function(e) {
	        if (e.which==16) {
	            that.shifted = true;
	        }    
	    });
	    $(document).keyup(function(e) {
	        if (e.which==16) {
	            that.shifted = false;
	        }    
	    });

		function util_defFor (arg, val) {
		    return typeof arg !== 'undefined' ? arg : val;
		}    

		function util_htmlEncode (str) {
		    return $('<div/>').text(value).html();
		}
		function util_htmlDecode (str) {
		    return $('<div/>').html(value).text();
		}

		function util_max (a) {

			var maxVal = parseInt(a[0]);
			for (var i=1; i<a.length; i++) {
				if (parseInt(a[i]) > maxVal) maxVal = parseInt(a[i]);
			}	
		    return maxVal;
		}

		function util_timeString (t) {
		    var m, s, t, p1, p2t;
		    t = t / 1000;
		    p1 = Math.floor(t);
		    m = Math.floor(p1/60);
		    s = Math.floor(p1-m*60);
		    p2t = (Math.floor( (t-p1)*10)).toString();
		    return (m.toString() + ":" + s.toString() + "." + p2t + "0".slice(0,1-p2t.length));
		}

		function twoDigits(d) {
		    if(0 <= d && d < 10) return "0" + d.toString();
		    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
		    return d.toString();
		}

		// pass a date object
		function util_toMysqlFormat (d) {
		    return d.getUTCFullYear() + "-" + 
		    twoDigits(1 + d.getUTCMonth()) + "-" + 
		    twoDigits(d.getUTCDate()) + " " + 
		    twoDigits(d.getUTCHours()) + ":" + 
		    twoDigits(d.getUTCMinutes()) + ":" + 
		    twoDigits(d.getUTCSeconds());
		}
		function util_timeToMysqlFormat (d) {
		    return twoDigits(d.getUTCHours()) + ":" + 
		    twoDigits(d.getUTCMinutes()) + ":" + 
		    twoDigits(d.getUTCSeconds());
		}
			

		function util_setInnerText(divName, text) {

				t = "#"+divName;
				if (!($(t).html(text))) {
					alert ("bad object: "+divName);
				}	
		}


		// Vertically align the given element inside it's parent 
		function util_vertAlign (e) {

			var pht = $($(e).parent()).height();
			var eht = $(e).height();
			var pos = Math.round((pht-eht)/2);

			$(e).css("margin-top",(pos.toString()+"px"));
		}

		// Vertically align the given element inside it's parent 
		function util_horizAlign (e) {

			var pw = $(e).parent().width();
			var ew = $(e).width();
			var pos = Math.round((pw-ew)/2);
			
			$(e).css("margin-left",(pos.toString()+"px"));
		}

		function util_convertTo2DecPct(amount){
		    return ( (util_convertTo2DecFloat(amount)*100).toString() + '%');
		}
		function util_convertTo2DecFloat(amount){
		    return util_parseFloat(amount.toFixed(2));
		}

		function util_show2decimals(amount){

			amt = util_convertTo2DecFloat(parseFloat(amount));
			hd = Math.floor(amt);
			st = (1000*(amt - hd)).toString()+"000";
			s = hd.toString() + "." + st.slice(0, 2);
			return s;
		}

		function util_parseFloat (n) {
		   var x = parseFloat(n);
		   if (isNaN(x)) {
		       return 0;
		   }
		   return x;
		}
		function util_parseInt (n) {
		   var x = parseInt(n);
		   if (isNaN(x)) {
		       return 0;
		   }
		   return x;
		}
		function util_isInt(n) {
		   var x = parseInt(n);
		   if (isNaN(x)) {
		       return false;
		   }
		   if (parseFloat(n) != x) {
		       return false;
		   }
		   return n == x;
		}


		function util_isNumber (o) {
		  return ! isNaN (o-0);
		}


		//------------------------------------------------------------------------
		// Generic Object Cloning Function
		//------------------------------------------------------------------------
		this.cloneObject = function (source) {
			var i;
			for (i in source) {
				if (typeof source[i] == 'source') {
		//			this[i] = new cloneObject(source[i]);
				} else {
					this[i] = source[i];
				}
			}	
		}
			
		this.centerInParentHoriz = function (e) {

		    var ep = $(e).parent();
		    var ew = $(e).width();
		    var epw = $(ep).width();
		    
		    e.css ("left", (epw-ew)/2 + "px");
		    
		}
		this.centerInParentVert = function (e) {

		  
		    var ep = $(e).parent();
		    var eh = $(e).height();
		    var eph = $(ep).height();
		    
		    e.css ("top", (eph-eh)/2 + "px");
		    
		}
		    
		function util_centerOf (e) {

			var pos = $(e).position();
			var w = $(e).width();
			var h = $(e).height();
			
			var res = new Object();
			
			res.left = pos.left + w / 2;
			res.top = pos.top + h / 2;
			res.x = res.left;
			res.y = res.top;

			return res;
			
		}


		this.formatJson = function (oData, sIndent) {
		    if (arguments.length < 2) {
		        var sIndent = "";
		    }
		    var sIndentStyle = "&nbsp&nbsp&nbsp&nbsp";
		    var sDataType = RealTypeOf(oData);

		    // open object
		    if (sDataType == "array") {
		        if (oData.length == 0) {
		            return "[]";
		        }
		        var sHTML = "[";
		    } else {
		        var iCount = 0;
		        $.each(oData, function() {
		            iCount++;
		            return;
		        });
		        if (iCount == 0) { // object is empty
		            return "{}";
		        }
		        var sHTML = "{";
		    }

		    // loop through items
		    var iCount = 0;
		    $.each(oData, function(sKey, vValue) {
		        if (iCount > 0) {
		            sHTML += ",";
		        }
		        if (sDataType == "array") {
		            sHTML += ("" + sIndent + sIndentStyle);
		        } else {
		            sHTML += ("<br>" + sIndent + sIndentStyle + "<b>\"" + sKey + "\"" + ": </b>");
		        }

		        // display relevant data type
		        switch (RealTypeOf(vValue)) {
		            case "array":
		            case "object":
		                sHTML += that.formatJson(vValue, (sIndent + sIndentStyle));
		                break;
		            case "boolean":
		            case "number":
		                sHTML += vValue.toString();
		                break;
		            case "null":
		                sHTML += "null";
		                break;
		            case "string":
		                sHTML += ("\"" + vValue + "\"");
		                break;
		            default:
		                sHTML += ("TYPEOF: " + typeof(vValue));
		        }

		        // loop
		        iCount++;
		    });

		    // close object
		    if (sDataType == "array") {
		        sHTML += ("<br>" + sIndent + "]");
		    } else {
		        sHTML += ("<br>" + sIndent + "}");
		    }

		    // return
		    return sHTML;
		}	

		function RealTypeOf(v) {
		  if (typeof(v) == "object") {
		    if (v === null) return "null";
		    if (v.constructor == (new Array).constructor) return "array";
		    if (v.constructor == (new Date).constructor) return "date";
		    if (v.constructor == (new RegExp).constructor) return "regex";
		    return "object";
		  }
		  return typeof(v);
		}

	}

	vgUTIL = new(util);

});
