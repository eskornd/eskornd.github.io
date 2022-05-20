// !!! DEPRECATED: make use of wcr-static webcenter_html.js

// Utilities to create html snippets for common controls and layout features
var WCHTML = {
    // properties

    ////////////////////////////////////////////////////////
    // public method for html formatting
    spacerImage : function(width,height) 
    {
      try {
        var htmlcode = '<img src="images/clearpixel.gif" ';
        if (width) htmlcode += ' width="' + width + '" ';
        if (height) htmlcode += ' height="' + height +'" ';
        htmlcode += ' />';
        
        return htmlcode;
      } 
      catch (err) {  // when it goes wrong, return nothing. 
        return '';
      }
    },
    getEmptyCol : function(span,width,height)
    {
      try {
        if (width==null) width = '10';
        if (height==null) height = '1';

        var htmlcode = '<td';
        if (span) htmlcode += ' colspan="' + span + '"';
        htmlcode +=  '>' + WCHTML.spacerImage(width,height) + '</td>';
        return htmlcode;
      }
      catch (err) {
        return '';
      }
    },
    getEmptyRow : function(span,width,height)
    {
      try {
        if (width==null) width = '1';
        if (height==null) height = '10';
        
        var htmlcode = '<tr>' + WCHTML.getEmptyCol(span,width,height) + '</tr>';
        return htmlcode;
      }
      catch (err) {
        return '';
      }
    },
	//////////////////////////////////////////////////////////
    // returns a string like Feb 17, 2010    
	getDateString: function(date) {
		try {
			return getLangFormattedDate(date);  // this function sits in XSL
		} catch(err) {
			// getLangFormattedDate does not exist
			try {
				return getDateString(date);
			} catch (err) {
				return date.toLocaleDateString();
			}
		}
	},
    //////////////////////////////////////////////////////////
    // returns a string like 09:35    
    getHourString :  function(date) {
      try {
		var hourString = date.getHours(); // forcing it to be a string
		if (hourString<10) hourString = "0" + hourString;
		var minuteString = date.getMinutes();
		if (minuteString <10) minuteString = "0" + minuteString;		
		return hourString + ":" + minuteString;
	  } catch (err) {
		return date;  
	  }
    },    
    //////////////////////////////////////////////////////////
    // returns a string like Feb 17, 2010 15:35    
    getDateHourString :  function(date) {
      try {
		var dateString = this.getDateString(date);
		var hourString = this.getHourString(date);
		return dateString + ' ' + hourString;
	  } catch (err) {
		return date;  
	  }
    },
    //////////////////////////////////////////////////////////
    // returns a string like Fri Oct 09 2009, 15:30
    getReadableDateAndTime : function(date) {
    	try {
    		var hourString = this.getHourString(date);
    		var dateString = date.toDateString();
    		return dateString + ", " + hourString;
    	} catch (err) {
    		return "" + date;	// date as string
    	}
	},

	///////////////////////////////////////////////////////////////////
	// rounds off a floating point number in a "smart way"
	// larger numbers just are rounded off to meaningfullDigits after the decimal point
	// smaller numbers (way smaller than 1) are rounded off trying to preserve meaningfullDigits
	// example 0.000000078 is not rounded off to 0 with meaningfullDigits = 6
	getFloatString: function(floatNumber,meaningfullDigits) {
		try {		
			if (Math.abs(floatNumber)<0.0000000000000000001) return 0;
			// find MFD after comma
			if (meaningfullDigits == null) meaningfullDigits=6;
			var fraction = floatNumber - Math.floor(floatNumber);
			var fractionLog = -Math.floor(Math.log(fraction)/Math.log(10));
			
			if (Math.abs(floatNumber)<0.9) {
				return Math.round(floatNumber * Math.pow(10,fractionLog + meaningfullDigits))/Math.pow(10,fractionLog + meaningfullDigits);
			} else {
				return Math.round(floatNumber * Math.pow(10,meaningfullDigits))/Math.pow(10, meaningfullDigits);
			}
			
		} catch(err) {
			return floatNumber;
		}
	},	
	testFloatString: function() {
		var msg="";
		msg += "123.456789 -> " + WCHTML.getFloatString(123.456789,6) + "\n";
		msg += "0.000000078 -> " + WCHTML.getFloatString(0.000000078,6) + "\n";
		msg += "100.0000003 -> " + WCHTML.getFloatString(100.0000003,6) + "\n";
		msg += "782364369988.45 -> " + WCHTML.getFloatString(782364369988.45,6) + "\n";
		msg += "99.999999998 -> " + WCHTML.getFloatString(99.999999998,6) + "\n";
		msg += "99.999998 -> " + WCHTML.getFloatString(99.999998,6) + "\n";
		msg += "0.0039999998 -> " + WCHTML.getFloatString(0.0039999998,6) + "\n";
		alert(msg);
	},
    //////////////////////////////////////////////////////////
    // returns formated full user name string (like: "Hornys, Jan (janh)")
	// Deprecated: please use the active text/html one
	getUserNameString: function(userObj) {
		let isRegUser = userObj.isRegisteredUser;
		if (isRegUser == undefined || isRegUser == null) isRegUser = userObj.isRegistered;
		let isRegisteredUser = (isRegUser || isRegUser == undefined) ? true : false;

		var nameString = "";
		if (!isRegisteredUser && userObj.eMail) {
			nameString = userObj.eMail;
		} else {
			if (userObj.lastName) nameString += userObj.lastName;
			
			if (userObj.firstName) {
				if (nameString.length > 0) nameString += ", ";
				nameString += userObj.firstName;
			}
			if (userObj.userName && isRegisteredUser) nameString += " (" + userObj.userName + ")";
		}
		return nameString;
    },
    //////////////////////////////////////////////////////////
    // returns formated full user name string (like: "Hornys, Jan (janh) [deactivated]") as Text
	getUserNameStringActiveText: function(userObj, options) {
		let isActive = userObj.isActive || typeof userObj.isActive == "undefined" ? true : false;

		let nameString = WCHTML.getUserNameString(userObj);
		if (!isActive) {
			nameString += " [" + options.deactivatedLangStr + "]";
		}
		return nameString;
    },
    //////////////////////////////////////////////////////////
    // returns formated full user name string (like: "Hornys, Jan (janh) deactivated"), but as HTML with a clickable link if userid is defined
	// @param {Object} userObj - this parameter has to be compatible with "approval member" object created in ApprovalMember.readMembers() method
	//      Supported values:
	//	        firstName,
	//	        lastName,
	//	        userName,
	//	        isActive,
	//          isRegisteredUser
	// @param {Object} options - Additional options not directly related to the "approval member".
	//      Supported values:
	//      	deactivatedLangStr,
	//      	hideIcon,
	//      	className,
	//      	legacyLink,
	//      	userid,  //TODO this should be probably moved to 'userObj', but it requires more refactoring...
	//      	projectid
    
    // IL: I haven't found any place from where this variant would be called. If confirmed by the CR, it can be removed.
	getUserNameStringActiveHTML: function(userObj, options) {
		var div = $("<div>");
		var classes = "";

		let isActive = userObj.isActive || typeof userObj.isActive == "undefined" ? true : false;

		let className = options.className || "";
		let legacyLink = options.legacyLink || false;
		let userid = options.userid || "";
		let projectid = options.projectid || "";

		if (!options.hideIcon) {
			var icon;
			if (isActive) {
				icon = $('<i class="icon icon-normal icon-grey icon-WCR_Assignee-User ' + className + ' "></i>');
			} else {
				icon = $('<i class="icon icon-normal icon-warning icon-WCR_Actions-User-Deactivate12 ' + className + ' "></i>');
			}
			div.append(icon);
			div.append("&nbsp;");
		}

		if (typeof isActive !== "undefined" && !isActive) {
			classes = "text-warning";
		}
		
		if (options.avatar) {
			div.append(options.avatar);
		}

		var span = $('<span class="' + classes + '">');
		span.text(WCHTML.getUserNameString(userObj));

		if (userid) {
			var link = $("<a>");
			if (!legacyLink) {
				link.attr("href", "#"); // allow tab to this link
				link.on("click", ShowUserDetails.bind(window, userid, projectid));
			} else {
				//This assumes a global ShowUserDetails function to be available
				link.attr("href", "javascript:ShowUserDetails('" + userid + "', '" + projectid + "')");
			}
			link.append(span);
			div.append(link);
		} else {
			div.append(span);
		}

		if (typeof isActive !== "undefined" && !isActive) {
			var deactivatedSpan = $('<span class="label label-warning">');
			deactivatedSpan.text(options.deactivatedLangStr);
			div.append("&nbsp;");
			div.append(deactivatedSpan);
		}
		if (userid) {
			return div;
		} else {
			return div.prop("innerHTML");
		}
	},

	//////////////////////////////////////////////////////////
    // checks whether input in elem is numeric 
	// @param option: 	null --> no further checking
	//					"Integer" --> must be integer number
	//					"Positive" --> must be positive
	//					"IntegerPositive"--> must be integer and positive (0 allowed)
	//					"IntegerPositiveStrict" --> must be integer and positive (0 not allowed)
	// @param alert: 	alerts the message
    checkNumericInput : function(elem,option,alert,oldvalue)  {
    	try {
			var  msg = "", value2;
			if (elem) {
				var value = elem.value;
				value = value.replace(/,/, '.');  //DT113167: when you enter a number like 13,67 at least do an effort of interpreting it as a float. Functions like isNaN and parseFloat don't listen to the locale.
				if (isNaN(value)) msg = "Not a number"; 
				if (option && option.substr(0,7) == "Integer") {
					value2 = parseInt(value);					
				} else {
					value2 = parseFloat(value);								
				}
				if (isNaN(value2)) value2="";	
				elem.value = value2;
				
				if (option) {
					if (option == "Positive" || option.substr(7,8)=="Positive") {
							if (value2<0) msg = "Can not be negative";
					}
					if (option == "IntegerPositiveStrict") {
						if (value==0) msg = "Can not be zero";
					}
				}
				if (msg){
					if(oldvalue){
						if(isNaN(oldvalue)){
							elem.value= NaN;
						} else {
							elem.value= oldvalue;
						}
					} else {
						elem.value=  "";
					}
				}
				if (alert) {
					alert(msg);
				}
			}	
    	} catch (err) {
		}
	  return '';
    },
    
	/**
	* naive check to see whether a string represents a hex Number
	* agreen will by mistake flag as hex because it is 6 characters and starts with a hex, so parseInt will not flag isNaN
	* all normal input is found well enough
	*/
	isHex: function (s) {
		return (s.length && !(s.length != 6 || isNaN(parseInt(s,16))));
	}, 
    
	/**
	 * Outputs the html code to display the given date (and time) on two lines
	 * @since WCR10.1
	 * @param date source date (Date object)
	 * @param style style for the 'TD' element/cell
	 */
	humanReadableDateAndTimeTwoLines : function(date,style) {
		var html_rowstyle = '<p class="' + style + '">';
		var datestring = WCHTML.getDateString(date);
		var hourstring = WCHTML.getHourString(date);
		var html_string = html_rowstyle + datestring + '<br/>';
		html_string += hourstring + '</p>';
		return html_string;
	},
	
	/**
	 * Gets the HTML class name(s) for displaying a date
	 * @since WCR10.1
	 * @param date source date (Date object)
	 * @param due due date (Date object) the source date should be compared to (show in red if exceeded)
	 * @param italic the source date should be displayed in italic (estimated dates)
	 * @param test3 test the 3days margin before the due date (show in orange)
	 */
	getDateStyle : function(date,due,italic,test3) {
		var style = '';
		if (due != null) {
			if (date.getTime() > due.getTime()) {
				style = 'text-danger';
			} else if (test3) {
				var threeDays = subtractDaysHours(due,3,0,null,true,false);	//dateShift.js
				if (date.getTime() > threeDays.getTime()) {
					style = 'text-warning';
				}
			}
		}
		if (italic) {
			style += ' text-italic';
		}
		return style;
	},
	 
	/**
    * Displays the typical webcenter hour dropdown by half-hours
    * @param {Int} hour currently selected hour
    * @param {String} id id to be given to the dropdown
    * @param {String} name name to be given to the dropdown
    * @param {String} changeMethod: name of javascript function with its parameters which will be called when the user changes the hour
    */
	displayHourDropdown: function(hour,id,name,changeMethod)  {
		var htmlcode = '';
		try {

			if (!id) throw("displayHourDropdown needs an id");
			if (!name) throw("displayHourDropdown needs a name");
			htmlcode +='<div class="input-group">';
			htmlcode += '<select id="' + id + '" name="' + name + '" class="form-control"';
			if (changeMethod) htmlcode += ' onchange="' + changeMethod + '"';			
			htmlcode += '>';

			// first the --:--
			if (hour == -1) {
				htmlcode += '<option value="-1" selected>--:--</option>';
			} else {
				htmlcode += '<option value="-1">--:--</option>';
			}
			for (var counter=0; counter < 24; counter++) {
				var value = counter * 2;
				var selected = (value == hour); // true or false
				var displaybase = counter<10 ? '0'+counter : counter;
				var display = displaybase + ":00";
				htmlcode += '<option value="' + value + '"' + (selected ? ' selected ' : '') + '>' + display + '</option>';
				value = counter * 2 + 1;
				display = displaybase + ":30";
				selected = (value == hour); // true or false
				htmlcode += '<option value="' + value + '"' + (selected ? ' selected ' : '') + '>' + display + '</option>';
			}
			htmlcode += '</select>';
			htmlcode +='<label for="' + id + '" class="form-datetime-btn input-group-addon"><i class="icon icon-normal icon-WCR_Clock"></i></label>';
			htmlcode +='</div>';
		} catch(err) {
			alert('Problem in WCHTML.displayHourDropdown ' +err);
		}
		return htmlcode;
	},
	/**
	* Scales an image proportionally to fit to maxwidth, maxheight
	*/
	scaleImageProportionally: function(imgObj, maxwidth, maxheight) {
		try {
			
			//since naturalHeight/naturalWidth is not supported for IE8 and older 
			//--> need to check the current client browser version
			var oldIE = false;
			var MSIEVersion = detectIE();
					
		    if (MSIEVersion && MSIEVersion <= 8) {
		        oldIE = true;
		    }
			
			var origHeight = 0;
			var origWidth = 0;
			
			if (!oldIE) {
				origHeight = imgObj.naturalHeight;
				origWidth = imgObj.naturalWidth;
			} else {
				origHeight = imgObj.height;
				origWidth = imgObj.width;
			}
			
			var ratioH = origHeight/maxheight;
			var ratioW = origWidth/maxwidth;
			
			if (ratioH > ratioW) {  // fit height if height is the limiting dimension...
				imgObj.width = origWidth/ratioH;
				imgObj.height = maxheight;
				
			} else {//...and vice versa
				imgObj.height = origHeight/ratioW;
				imgObj.width = maxwidth;
			}
			
		} catch(err) {
			// just jump out...
		}
	},
	/**
	* rotates over images. To be called as follows: <img src="myImage.jpg" onerror="alternativeImage(this)">
	*/
	alternativeImage: function(elem,alternative) {
		try {
			
			if (elem) {
				var splitArr = elem.src.split(".");
				var extension = splitArr[splitArr.length-1];
				var firstpart = elem.src.substr(0,elem.src.length-extension.length-1);
								
				switch  (extension) {
					case "jpg":
						//elem.src = firstpart + ".gif"; break;
						setTimeout(function(){ elem.src = firstpart + ".gif"; }, 10);break;
					case "gif":
						setTimeout(function(){ elem.src = firstpart + ".png"; }, 10); break;
					
					case "png":
						setTimeout(function(){ elem.src = firstpart + ".jpeg"; }, 10); break;
					case "jpeg":
						setTimeout(function(){ elem.src = firstpart + ".bmp"; }, 10); break;
					default:
						setTimeout(function(){ elem.src = alternative; elem.onerror =  'WCHTML.alternativeImage(this,null);';}, 10);
						 
						  // in case alternative doesn't work, put it on null --> shows the broken image but does't loop for ever
						break;  // alternative
					
					
				} // end switch
				
			}
			
		} catch(err) {
			alert('Problem in WCHTML.AlternativeImage at line '+ err.lineNumber + ': ' + err);
		}
	
	},

	/**
	 * Filters on string
	 * @param value - text to be filtered
	 * @param attributeFilter - the filter expression
	 * @returns {Boolean} - if it pass the filter
	 */
	passesFilter : function(value, attributeFilter) {

		try {
			value = value.toLowerCase();
			if (!attributeFilter) {  // covers attributeFilter == "" but also null, undefined, ... 
				return true;
			} else if (attributeFilter.indexOf("*") == -1) {
				if (value.indexOf(attributeFilter.toLowerCase()) != -1) {
					return true;
				} else {
					return false;
				}
			} else {
				// Filter contains a * --> split it into the * portions
				var splitFilter =  attributeFilter.split("*");
				return WCHTML.filter_iterateOverStars(value, splitFilter);				
			}
					
		} catch(err) {  
			alert("line " + err.lineNumber + ": " +  err.message );
	        return true;
	    }
	},

	filter_iterateOverStars : function(value, splitFilter) {
		var tempTail = value;
		for (var i = 0; i < splitFilter.length; i++) {
			tempTail = WCHTML.filter_findSubstringReturnTail(tempTail, splitFilter[i]);
			if (tempTail == null) {
				return false;
			}
	    }
		return true;
	}, 

	/**
	 * Search occurence of pattern in a string. If found, returns the rest of the string behind the first occurence. Otherwise return 'undefined'...
	 * @param string
	 * @param pattern
	 * @returns
	 */
	filter_findSubstringReturnTail : function(value, pattern) {
		var firstIndex = value.indexOf(pattern);
		var tail = null;
		if (firstIndex > -1) {
			tail = value.substr(firstIndex + pattern.length);
		}
		return tail;
	},
	
	// FRACTIONAL ATTRIBUTES HELPERS
	/**
	* accepts fractional data in one of following formats: 
	* 1:08 means 1 plus 8/16 inch
	* 1`08 means the same (the separator is backquote)
	* `08 is not accepted, should be 0`08
	* 1 + 1/4 means 1 plus 1/4 inch. Any integer for nominator and denominator are accepted
	* 1 1/4 means the same (at least 1 space between the integer and the fractional part
	* 1/2  means 0.5 (so no integer part)
	* @return returns a float
	*/
	fractionalToDecimal: function(fString) {
		var value = null, intPart, decPart, nominator, denominator;
		try {
			
			fString = $.trim(fString);
			// find a :
			var sepIndex = fString.indexOf(':');
			if (sepIndex <0) {
				// find a `
				sepIndex = fString.indexOf('`');
			}
			if (sepIndex >= 0 ) {
				intPart = parseInt(fString.substring(0,sepIndex),10);
				decPart = parseInt(fString.substring(sepIndex+1),10);  // until the end
				value = intPart + decPart/16;
			} else {
				// not of the type 1:08 or 1`08 --> look for a /
				var divIndex = fString.indexOf('/');
				if (divIndex > 0) {
					// has a fraction in it. Find the integer part
					sepIndex = fString.indexOf('+');
					if (sepIndex<0) sepIndex = fString.indexOf(' ');
					if (sepIndex>0) {
						// has a + or a space
						intPart = parseInt(fString.substring(0,sepIndex),10);
						nominator = parseInt(fString.substring(sepIndex+1,divIndex),10);
						denominator = parseInt(fString.substring(divIndex+1),10);
						value = intPart + nominator/denominator;
					} else {
						// there is a divider but no + or space --> interprete as a simple fraction
						nominator = parseInt(fString.substring(0,divIndex),10);
						denominator = parseInt(fString.substring(divIndex+1),10);
						value = nominator/denominator;
					}
				} 
				
			
			}
			if (value == null) value = parseFloat(fString);
			
		} catch (err) {
			alert("Problem in WCHTML.fractionalToDecimal: "+err);
			return fString;
		}
		return value;
	}, 
	/**
	* array with fractions, will be filled by createFractions which is always called.
	*/
	fractions: [], 
	createFractions: function () {
		var denominators = [2,4,8,16,32,64,128];
		
		for (var i=0;i<denominators.length;i++) {
			var denominator = denominators[i];
			for (var nominator=1; nominator<denominator; nominator+=2) {
				var newObject = {};
				newObject.d = nominator/denominator;
				newObject.frac = String(nominator)+'/'+String(denominator);
				this.fractions.push(newObject);		
			}
		}
	},   
	
	 
	/**
	* converts a floating point to a string with a fractional representation in the form a + b/c
	* example 10.25 will be shown as 10 + 1/4
	* @return {String} fractional representation as a string, or {float} the original value if no fractional representation is found
	*/
	decimalToFractional: function(value) {
		// build up a table
		var intPart = Math.floor(value);
		var decPart = value-intPart;
		var fracTable = WCHTML.fractions;
		if (Math.abs(decPart) > 0.000001) {
			for (var i=0; i< fracTable.length; i++) {
				if (Math.abs(fracTable[i].d - decPart) < 0.000002) {
					return (intPart? String(intPart) + ' + ' : '') + fracTable[i].frac;					
				}
			}
		}
		return value;
	
	},
	testFractionalToDecimal: function () {
		var inputArr = ['1:08','1`08','0:04','1 + 2/16', '1/64','32/64','2 4/16',' 3/4 ','2   5 / 8 ',' 2 7/8'];   // To do: add more and more difficult cases
		var output = '';
		for (var idx=0; idx< inputArr.length; idx++) {
			var decimalValue = this.fractionalToDecimal(inputArr[idx]);
			var newDecimalValue = decimalValue + (Math.random()-0.5)/1000000;
			var newFractionalValue = this.decimalToFractional(newDecimalValue);
			output += '\n' + inputArr[idx] + '   ->   ' + decimalValue + '   ->   ' + newFractionalValue;
		}
		
		alert(output);
	
	},	
	encodeForJScript: function(value) {
		if (!value) return '';
		value = value.replace(/\\/g, "\\\\");
		value = value.replace(/'/g, "\\'");
		value = value.replace(/"/g, "\\\"");

		return value;
	},
	
	// Functions for Mobile support
	/**
	* Check if the device is a mobile device
	* @returns {Boolean} - true if the current device is a mobile device
	*/
	isMobile: function() {
		return document.body.className.indexOf("mobile")>=0;
	},
	
	/**
	 * Function to enable/disable all submit buttons on the page.
	 * @param {jQuery object/HTML element} actionForm - object representing the HTML form element where all the submit buttons are
	 * @param {boolean} enable - TRUE if the submit buttons should be enabled, FALSE otherwise.
	 */
	enableSubmitButtons: function(actionForm, enable) {
		$(actionForm).find("[type=submit], [type=button]").not(".forceSubmit").each(function() {
			this.disabled = !enable;
		});
	}, 
	
	/**
	* Scales an image proportionally to fit to maxwidth, maxheight
	*/
	getIEVersion: function() {
		return detectIE();
	},
	
};

window.WCHTML = WCHTML;

/**
 * Read selection from select box and add to list underneath it
 * @param elem
 * @param warningMsg
 * @param selectId
 * @param tableId
 * @param varname
 * @param onclickString - optional value for the onclick action to be applied for an <a> element for the selection
 * @param removeFunctionName - optional name of the function that's called when removing the row from a table
 */
window.addSelection = function addSelection(elem, warningMsg, selectId, tableId, varname, onclickString, removeFunctionName){
	var selection = $(elem).find("option:selected");
	var selectionName = selection.text();
	var selectionId = selection.val();

	return addToSelectedList(selectionId+'Id', selectionId, selectionName, warningMsg, selectId, tableId, varname, onclickString, removeFunctionName);
}

/**
 * Adds given value as a new row in the table in which the select element is
 * @param rowID
 * @param valueID
 * @param selectionName
 * @param warningMsg
 * @param selectID
 * @param tableID
 * @param varname
 * @param onclickString - optional value for the onclick action to be applied for an <a> element for the selection
 * @param removeFunctionName - optional name of the function that's called when removing the row from a table. 
 *                             the default is set to 'removeRow'
 *
 */
window.addToSelectedList = function addToSelectedList(rowID, valueID, selectionName, warningMsg, selectID, tableID, varname, onclickString, removeFunctionName){
	if (onclickString===undefined || onclickString===null) {
		onclickString = "";
	}
	if (removeFunctionName===undefined || removeFunctionName===null || removeFunctionName==="") {
		removeFunctionName = 'removeRow';
	}
	
	//check if the row already exists (element already selected)
	if($("#"+rowID).length > 0) 
	{
		alert(warningMsg);
		$("#"+selectID+" [value='']").prop("selected", true);
		return false;
	}
	
	//write new rows as HTML to the table
	var membersTable = $("#"+tableID);
	
	var html = '<li id="' + rowID + '">';
	html += '<a class="btn btn-no-border btn-no-margin"><i href="#" onclick="javascript:'  + removeFunctionName + '(\'' + rowID + '\');return false;" class="icon icon-normal icon-WCR_Remove"></i> </a>';
	if (onclickString!=="") {
		html += '<a href="#" onclick="' + onclickString + '">';
	}
	html +=  WCXML.xmlencode(selectionName);
	if (onclickString!=="") {
		html += '</a>';		
	}
	html += '<input type="hidden" name="'+varname+'" value="' + valueID + '"/></li>';
	
	// Append html to table
	membersTable.append(html);
	
	// Put Selection Box back to please select
	$("#"+selectID+" [value='']").prop("selected", true);
	
	return true;
}

//Function to remove a project Member
window.removeRow = function removeRow(rowID) {
	// Remove the user from the table
	var row = "#" + rowID;
	$(row).remove();
}

//Used for project and document filtering
window.toggleFilter = function toggleFilter(inputBoxId, selectBoxId) {
	var inputBox = $("#" + inputBoxId);
	var selectBox = $("#" + selectBoxId);
	if (selectBox.data("loading") != null) // check if loading property is set; if it is exit
		return;	
	var selectedValue = selectBox.children(":selected").val();
	
	if(inputBox.filter(":visible").length > 0) {
		inputBox.hide();
		inputBox[0].blur();
		inputBox.val("");
		selectBox[0].size = 1;
		selectBox.html(selectBox.data('copyhtml'));
		selectBox.data('copyhtml', null);
		selectBox.children("[value='" + selectedValue + "']").prop("selected", true);
	} else {
		inputBox.show();
		selectBox.data('copyhtml', selectBox.html());
		filterSelectBox(inputBox.get()[0], selectBoxId); // switch to show in list mode	
		inputBox[0].focus();
	}
}

// hide filter associated with select box
window.hideFilter = function hideFilter(inputBoxId, selectBoxId, resetSelect) {
	var inputBox = $("#" + inputBoxId);
	var selectBox = $("#" + selectBoxId);
	if (selectBox.data("loading") != null) // check if loading property is set; if it is exit
		return;
	var selectedValue = selectBox.children(":selected").val();
	
	if(inputBox.filter(":visible").length > 0) {
		inputBox.hide();
		inputBox[0].blur();
		inputBox.val("");
		selectBox[0].size = 1;
		selectBox.html(selectBox.data('copyhtml'));
		selectBox.data('copyhtml', null);
		if(resetSelect){
			selectBox.children("[value='']").prop("selected", true);
		}else{
			selectBox.children("[value='" + selectedValue + "']").prop("selected", true);
		}
	}
}

// Actual filtering of select boxes is done in this function
window.filterSelectBox = function filterSelectBox(inputBox, selectBoxId, autoOnHit) {
	var inputBoxValue = inputBox.value.toLowerCase();
	var selectBox = $("#" + selectBoxId);
	if (selectBox.data("loading") != null) // check if loading property is set; if it is exit
		return;
	
	selectBox.html(selectBox.data('copyhtml'));
	
	if (inputBoxValue.length > 0) {
		selectBox.children().filter(function(index) {
			var textContents = $(this).text().toLowerCase();
			var regExpression = new RegExp(inputBoxValue, "i");
			var returnValue = (textContents.search(regExpression) == -1);
			return returnValue;
		}).remove();
	}
	
	// Change the select box into a list
	var visibleCount=selectBox.children().length;
	// If the user has found a selection
	if (visibleCount == 1) {
		if (autoOnHit) {
			selectBox[0].size = 1;
			selectBox.children()[0].selected = true;
			hideFilter(inputBox.id, selectBoxId);
			selectBox.trigger("change");
		} else {
			selectBox[0].size = 2; // do not collapse until user selects
		}
	} // Shrink the list to fit
	else if(visibleCount >= 10)
		selectBox[0].size = 10;
	else if (visibleCount ==  0)
		selectBox[0].size = 2; 
	else
		selectBox[0].size = visibleCount + 1;
	// scroll to the top
	selectBox.scrollTop(0);
}

/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 * 
 * https://support.microsoft.com/cs-cz/kb/167820/en-us
 */
window.detectIE = function detectIE() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
       // IE 12 => return version number
       return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}


WCHTML.createFractions(); // initialize fractions
