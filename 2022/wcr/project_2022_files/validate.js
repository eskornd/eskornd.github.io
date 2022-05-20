// BOI, followed by one or more whitespace characters, followed by EOI.
var reWhitespace = /^\s+$/;
// whitespace characters as defined by this sample code
var whitespace = " \t\n\r";
// Check whether string s is empty.

function isEmpty(s)
{
   return((s == null) ||(s.length == 0));
}
// Returns true if string s is empty or 
// whitespace characters only.

function isWhitespace(s)
{
   // Is s empty?
   return(isEmpty(s) || reWhitespace.test(s));
}

/**
 * Returns true if the value length is bigger than the given size
 */
function isMaxSize(value, size)
{
	return ((value != null) && (value.length > size));
}

/**
 * Returns true if the value is empty/whitespace or bigger than the given size
 */
function isWhitespaceMaxSize(value, size) {
	return (isWhitespace(value) || isMaxSize(value,size));
}

// charInString (CHARACTER c, STRING s)
//
// Returns true if single character c (actually a string)
// is contained within string s.

function charInString(c, s)
{
   for(i = 0; i < s.length; i++)
   {
      if(s.charAt(i) == c)
      return true;
   }
   return false;
}

function isValidOutputName(s)
{
   var specialCharString = "\\/:*?\"|;";
   var lessThan = "<";
   var graterThan = ">";
   
   for(i = 0; i < s.length; i++)
   {
      var curChar = s.charAt(i);
      if (specialCharString.indexOf(curChar) != -1) 
        return false;
      else if (lessThan.indexOf(curChar) != -1) 
      	   return false;
      else if (graterThan.indexOf(curChar) != -1) 
          return false;
   }
   return true;
}

function isValidOutputNameEx(inputString , excludeChars)
{
   var specialCharString = excludeChars ;
   var lessThan = "<";
   var graterThan = ">";
   
	var index ;

   for(i = 0; i < inputString.length; i++)
   {
      var curChar = inputString.charAt(i);
index = specialCharString.indexOf(curChar) ;

      if (specialCharString.indexOf(curChar) != -1) 
        return false;
      else if (lessThan.indexOf(curChar) != -1) 
      	   return false;
      else if (graterThan.indexOf(curChar) != -1) 
          return false;
   }
   return true;
}


// Removes initial (leading) whitespace characters from s.
// Global variable whitespace (see above)
// defines which characters are considered whitespace.

function stripInitialWhitespace(s)
{
   var i = 0;
   while((i < s.length) && charInString(s.charAt(i), whitespace)) i++;
   return s.substring(i, s.length);
}
// Removes initial (leading) whitespace characters from s.
// Global variable whitespace (see above)
// defines which characters are considered whitespace.

function stripTrailingWhitespace(s)
{
   var i = s.length - 1;
   while((i >= 0) && charInString(s.charAt(i), whitespace)) i--;
   return s.substring(0, i + 1);
}

function validateKeywordSearchPhrase(msg)
{
   // Validate user name
   var phraseLength = document.advancedsearchform.db_keyword.value.length;
   if(phraseLength == 0)
   {
      alert(msg);
      document.MM_returnValue = false;
      return false;
   }
   document.MM_returnValue = true;
}

function validateLoginForm(invalidusernamemsg)
{
   var temp = document.loginform.username.value;
   if((temp == null) ||(temp.length == 0))
   {
      alert(invalidusernamemsg);
      document.MM_returnValue = false;
      return false;
   }
   document.MM_returnValue = true;
}

function updateNumericSearchTypeLabel(select, labelfieldname, tolerancefieldname, negativeToleranceErrorMsg)
{
   var label = document.getElementById(labelfieldname);
   if(select.value == "equals")
   {
      label.childNodes.item(0).nodeValue = "+/-";
      var toleranceValue = tolerancefieldname.value;
      if(toleranceValue != null)
      {
         if(toleranceValue.indexOf("-") != - 1)
         {
            // Tell them that negative tolerances are not allowed
            alert(negativeToleranceErrorMsg);
            return false;
         }
      }
   }
   else 
   {
      label.childNodes.item(0).nodeValue = '<=';
   }
   return true;
}

/* The updateNumericSearchTypeLabel() method (above) doesn't work on the 'My Work' page.
   Seems to be a problem with the length of the parms passed to the method.
   Adding the HPSectionId seems to push it over the edge !!!! - GEMU */	
function updateNumericSearchTypeLabel1(hpSectionId, prefix, suffix, negativeToleranceErrorMsg)
{
   var selectField = window.document.getElementById(hpSectionId + prefix + 'select_' + suffix);
   var labelFieldName = hpSectionId + prefix + 'label_'+ suffix ;
   var toleranceField = window.document.getElementById(hpSectionId + prefix + 'input_2_' + suffix);
   
   return updateNumericSearchTypeLabel(selectField, labelFieldName, toleranceField, negativeToleranceErrorMsg);
}

function validateFloat(element, errorMsg)
{
   var value = element.value;
   // Blank field is allowed
   if(value == "")
   return true;
   var checkNum = parseFloat(value);
   if(isNaN(checkNum))
   {
      // They did not enter a number...
      alert(errorMsg);
      //element.value="";
      return false;
   }
   if(checkNum != value)
   {
      // They entered something with a number at the front - e.g. 12Y
      alert(errorMsg);
      //element.value=checkNum;
      return false;
   }
   return true;
}

function validateFloatWithOptions(element, errorMsg, allowBlank, allowNegative, allowZero)
{
   var value = element.value;
   // Blank field is allowed
   if(value == "")
   {
      if(allowBlank)
      return true;
      else 
      {
         alert(errorMsg);
         return false;
      }
   }
   var checkNum = parseFloat(value);
   if(isNaN(checkNum))
   {
      // They did not enter a number...
      alert(errorMsg);
      //element.value="";
      return false;
   }
   if(checkNum != value)
   {
      // They entered something with a number at the front - e.g. 12Y
      alert(errorMsg);
      //element.value=checkNum;
      return false;
   }
   if(!allowNegative &&(checkNum < 0))
   {
      alert(errorMsg);
      return false;
   }
   if(!allowZero &&(checkNum == 0))
   {
      alert(errorMsg);
      return false;
   }
   return true;
}

function validateInt(element, errorMsg)
{
   var value = element.value;
   // Blank field is allowed
   if(value == "")
   return true;
   var checkNum = parseInt(value);
   if(isNaN(checkNum))
   {
      // They did not enter an integer...
      alert(errorMsg);
      //element.value="";
      return false;
   }
   if(checkNum != value)
   {
      // They entered something with a number at the front - e.g. 12Y
      alert(errorMsg);
      //element.value=checkNum;
      return false;
   }
   if(value.indexOf(".") != - 1)
   {
      // They entered something with a decimal point.
      // JavaScript thinks 100.0 is an int but Java
      // on the server disagrees.
      alert(errorMsg);
      //element.value=checkNum;
      return false;
   }
   return true;
}

function validateStrictPositiveInt(element, errorMsg)
{
	var value = validatePositiveInt(element, errorMsg);
	if (value == true )
	{
		var checkNum = parseInt(element.value);   	
		if (checkNum == 0)
		{
	      alert(errorMsg);
	      return false;
		} 
	} 
	return value ;
}

//JAMI > same as validateInt but accepts only positive numbers
function validatePositiveInt(element, errorMsg)
{
   var value = element.value;
   // Blank field is allowed
   if(value == "") 
   {
   	return true;
   }
    
   var checkNum = parseInt(value);
   
   if(isNaN(checkNum))
   {
      // They did not enter an integer...
      alert(errorMsg);
      return false;
   }
   if(checkNum != value)
   {
      // They entered something with a number at the front - e.g. 12Y
      alert(errorMsg);
      //element.value=checkNum;
      return false;
   }
   if(value.indexOf(".") != - 1)
   {
      // They entered something with a decimal point.
      // JavaScript thinks 100.0 is an int but Java
      // on the server disagrees.
      alert(errorMsg);
      //element.value=checkNum;
      return false;
   }
   if (checkNum < 0)
   {
   	  alert(errorMsg);
   	  return false;
   }
   return true;
}


// Use validatePartialFloat and validatePartialInt to validate
// numbers that may not yet be fully typed (e.g., just a decimal
// point so far)

function validatePartialFloat(element, allowNegative, errorMsg)
{
   var value = element.value;
   // Blank field is allowed
   if(value == "")
   return true;
   // The user has only entered a decimal point and/or negative sign so far
   if(allowNegative)
   {
      if(value == "-")
      return true;
      if(value == "-.")
      return true;
   }
   if(value == ".")
   return true;
   var checkNum = parseFloat(value);
   if(isNaN(checkNum))
   {
      // They did not enter a number...
      alert(errorMsg);
      element.value = "";
      return false;
   }
   if(checkNum != value)
   {
      // They entered something with a number at the front - e.g. 12Y
      alert(errorMsg);
      element.value = checkNum;
      return false;
   }
   if(!allowNegative &&(checkNum < 0))
   {
      alert(errorMsg);
      return false;
   }
   return true;
}

function validatePartialInt(element, allowNegative, errorMsg)
{
   var value = element.value;
   // Blank field is allowed
   if(value == "")
   return true;
   // The user has only entered a negative sign so far
   if(allowNegative &&(value == "-"))
   return true;
   var checkNum = parseInt(value);
   if(isNaN(checkNum))
   {
      // They did not enter an integer...
      alert(errorMsg);
      element.value = "";
      return false;
   }
   if(checkNum != value)
   {
      // They entered something with a number at the front - e.g. 12Y
      alert(errorMsg);
      element.value = checkNum;
      return false;
   }
   if(value.indexOf(".") != - 1)
   {
      // They entered something with a decimal point.
      // JavaScript thinks 100.0 is an int but Java
      // on the server disagrees.
      alert(errorMsg);
      element.value = checkNum;
      return false;
   }
   if(!allowNegative &&(checkNum < 0))
   {
      alert(errorMsg);
      element.value = checkNum.toString().substring(1); 
      return false;
   }
   return true;
}

function validatePartialFloatForTolerance(select, toleranceErrorMsg, element, allowNegative, errorMsg)
{
   if(select.value == "equals")
   return validatePartialFloat(element, false, toleranceErrorMsg);
   else 
   return validatePartialFloat(element, allowNegative, errorMsg);
}

function validatePartialIntForTolerance(select, toleranceErrorMsg, element, allowNegative, errorMsg)
{
   if(select.value == "equals")
   return validatePartialInt(element, false, toleranceErrorMsg);
   else 
   return validatePartialInt(element, allowNegative, errorMsg);
}

function validateEmail(value) 
{
	//does the email contain personal info ?
	if (value.indexOf('<') != -1) // process only the email part
        		{ // find start index of email part
        			var startIndex = value.indexOf('<')+1;
        			if (value.indexOf('>') != -1) 
        			{ //find end index of email part
        				var endIndex = value.indexOf('>');
        				// strip the value only to the email part
        				value = stripInitialWhitespace(value.substring(startIndex, endIndex)); 
        			} else return false;
        		} 
	//var filter  = /^[a-zA-Z][\w\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]\.[a-zA-Z][a-zA-Z\.]*[a-zA-Z]$/;
	var filter = new RegExp("^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$");
	if (filter.test(value.toLowerCase())) return true;
	else return false;
}

function validateURL(value)
{
	//jQuery validaion plugin - extended to allow host name without not to require .domain
	//return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/.test(value);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
	return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
function imposeMaxLength(Object, MaxLen, errorMsg)
{
	if (Object.value.length > MaxLen + 1)
	{
		if (errorMsg) 
		{
			alert(errorMsg);
		}
		Object.value = Object.value.substring(0, MaxLen);
	}
	else if (Object.value.length > MaxLen) 
	{
		Object.value = Object.value.substring(0, MaxLen);
	}
	return true;
}

//JANH to be extend!
function validateFileName(s)
{
  return isEmpty(s);
}

// Validate document description
// Can be empty, but can't exceed 256 characters
// Returns true if the description is valid
function validateDocDescription(desc)
{
	return isEmpty(desc) || desc.length < 257; 
}


//JAMI int validation for hours (only int between 0...24)
function validateHours(element, errorMsg)
{
	var value = element.value;
	
   //Blank field is allowed
   if(value == "") {
   	return true;
   }
    
   var checkNum = parseInt(value);
   
   //Check for type
   if(isNaN(checkNum))
   {
      // They did not enter an integer...
      alert(errorMsg);
      //element.value="";
      return false;
   }
   
   //Check for mixup of value type
   if(checkNum != value)
   {
      // They entered something with a number at the front - e.g. 12Y
      alert(errorMsg);
      return false;
   }
   
   //Check if a floating number was not entered
   if(value.indexOf(".") != - 1)
   {
      // They entered something with a decimal point.
      // JavaScript thinks 100.0 is an int but Java
      // on the server disagrees.
      alert(errorMsg);
      return false;
   }

   //now check for actual int value - accept only a number between 0 and 24
   if ((checkNum < 0) || (checkNum > 24)) 
   {
   		//the value entered is not valid for an hour value
   		alert(errorMsg);
	    return false;
   }
   
   return true;   
}

/** 
 * @param element - DOM input element
 * @param message - i18 Message to be shown to the user
 * @returns {Boolean}
 */
function validateInputFieldForWhiteSpace(element, message) {
	// check to make sure the certain fields are not empty
	if (isWhitespace(element.value))
	{
		alert(message);
		return false;
	} else {
		return true;
	} 
}
